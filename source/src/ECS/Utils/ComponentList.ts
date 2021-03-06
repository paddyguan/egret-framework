///<reference path="../Components/IUpdatableComparer.ts" />
module es {
    export class ComponentList {
        /**
         * 组件列表的全局updateOrder排序
         */
        public static compareUpdatableOrder: IUpdatableComparer = new IUpdatableComparer();
        public _entity: Entity;

        /**
         * 添加到实体的组件列表
         */
        public _components: Component[] = [];
        /**
         * 添加到此框架的组件列表。用来对组件进行分组，这样我们就可以同时进行加工
         */
        public _componentsToAdd: Component[] = [];
        /**
         * 标记要删除此框架的组件列表。用来对组件进行分组，这样我们就可以同时进行加工
         */
        public _componentsToRemove: Component[] = [];
        public _tempBufferList: Component[] = [];
        /**
         * 用于确定是否需要对该框架中的组件进行排序的标志
         */
        public _isComponentListUnsorted: boolean;

        constructor(entity: Entity) {
            this._entity = entity;
        }

        public get count() {
            return this._components.length;
        }

        public get buffer() {
            return this._components;
        }

        public markEntityListUnsorted() {
            this._isComponentListUnsorted = true;
        }

        public add(component: Component) {
            this._componentsToAdd.push(component);
        }

        public remove(component: Component) {
            if (this._componentsToRemove.contains(component))
                console.warn(`You are trying to remove a Component (${component}) that you already removed`);

            // 这可能不是一个活动的组件，所以我们必须注意它是否还没有被处理，它可能正在同一帧中被删除
            if (this._componentsToAdd.contains(component)) {
                this._componentsToAdd.remove(component);
                return;
            }

            this._componentsToRemove.push(component);
        }

        /**
         * 立即从组件列表中删除所有组件
         */
        public removeAllComponents() {
            for (let i = 0; i < this._components.length; i++) {
                this.handleRemove(this._components[i]);
            }

            this._components.length = 0;
            this._componentsToAdd.length = 0;
            this._componentsToRemove.length = 0;
        }

        public deregisterAllComponents() {
            for (let i = 0; i < this._components.length; i++) {
                let component = this._components[i];

                // 处理渲染层列表
                if (component instanceof RenderableComponent) {
                    if (component.displayObject.parent)
                        component.displayObject.parent.removeChild(component.displayObject);
                    this._entity.scene.renderableComponents.remove(component);
                }

                if (component.debugDisplayObject.parent)
                    component.debugDisplayObject.parent.removeChild(component.debugDisplayObject);

                this._entity.componentBits.set(ComponentTypeManager.getIndexFor(component), false);
                this._entity.scene.entityProcessors.onComponentRemoved(this._entity);
            }
        }

        public registerAllComponents() {
            for (let i = 0; i < this._components.length; i++) {
                let component = this._components[i];

                if (component instanceof RenderableComponent) {
                    this._entity.scene.addChild(component.displayObject);
                    this._entity.scene.renderableComponents.add(component);
                }

                this._entity.scene.addChild(component.debugDisplayObject);
                this._entity.componentBits.set(ComponentTypeManager.getIndexFor(component));
                this._entity.scene.entityProcessors.onComponentAdded(this._entity);
            }
        }

        /**
         * 处理任何需要删除或添加的组件
         */
        public updateLists() {
            if (this._componentsToRemove.length > 0) {
                for (let i = 0; i < this._componentsToRemove.length; i++) {
                    this.handleRemove(this._componentsToRemove[i]);
                    this._components.remove(this._componentsToRemove[i]);
                }

                this._componentsToRemove.length = 0;
            }

            if (this._componentsToAdd.length > 0) {
                for (let i = 0, count = this._componentsToAdd.length; i < count; i++) {
                    let component = this._componentsToAdd[i];
                    if (component instanceof RenderableComponent) {
                        this._entity.scene.addChild(component.displayObject);
                        this._entity.scene.renderableComponents.add(component);
                    }

                    this._entity.scene.addChild(component.debugDisplayObject);
                    this._entity.componentBits.set(ComponentTypeManager.getIndexFor(component));
                    this._entity.scene.entityProcessors.onComponentAdded(this._entity);

                    this._components.push(component);
                    this._tempBufferList.push(component);
                }

                // 在调用onAddedToEntity之前清除，以防添加更多组件
                this._componentsToAdd.length = 0;
                this._isComponentListUnsorted = true;

                // 现在所有的组件都添加到了场景中，我们再次循环并调用onAddedToEntity/onEnabled
                for (let i = 0; i < this._tempBufferList.length; i++) {
                    let component = this._tempBufferList[i];
                    component.onAddedToEntity();

                    // enabled检查实体和组件
                    if (component.enabled) {
                        component.onEnabled();
                    }
                }

                this._tempBufferList.length = 0;
            }

            if (this._isComponentListUnsorted) {
                this._components.sort(ComponentList.compareUpdatableOrder.compare);
                this._isComponentListUnsorted = false;
            }
        }

        public handleRemove(component: Component) {
            // 处理渲染层列表
            if (component instanceof RenderableComponent) {
                if (component.displayObject.parent)
                    component.displayObject.parent.removeChild(component.displayObject);
                this._entity.scene.renderableComponents.remove(component);
            }

            if (component.debugDisplayObject.parent)
                component.debugDisplayObject.parent.removeChild(component.debugDisplayObject);
            this._entity.componentBits.set(ComponentTypeManager.getIndexFor(component), false);
            this._entity.scene.entityProcessors.onComponentRemoved(this._entity);

            component.onRemovedFromEntity();
            component.entity = null;
        }


        /**
         * 获取类型T的第一个组件并返回它
         * 可以选择跳过检查未初始化的组件(尚未调用onAddedToEntity方法的组件)
         * 如果没有找到组件，则返回null。
         * @param type
         * @param onlyReturnInitializedComponents
         */
        public getComponent<T extends Component>(type, onlyReturnInitializedComponents: boolean): T {
            for (let i = 0; i < this._components.length; i++) {
                let component = this._components[i];
                if (component instanceof type)
                    return component as T;
            }

            // 我们可以选择检查挂起的组件，以防addComponent和getComponent在同一个框架中被调用
            if (!onlyReturnInitializedComponents) {
                for (let i = 0; i < this._componentsToAdd.length; i++) {
                    let component = this._componentsToAdd[i];
                    if (component instanceof type)
                        return component as T;
                }
            }

            return null;
        }

        /**
         * 获取T类型的所有组件，但不使用列表分配
         * @param typeName
         * @param components
         */
        public getComponents(typeName: string | any, components?) {
            if (!components)
                components = [];

            for (let i = 0; i < this._components.length; i++) {
                let component = this._components[i];
                if (typeof (typeName) == "string") {
                    if (egret.is(component, typeName)) {
                        components.push(component);
                    }
                } else {
                    if (component instanceof typeName) {
                        components.push(component);
                    }
                }
            }

            for (let i = 0; i < this._componentsToAdd.length; i++) {
                let component = this._componentsToAdd[i];
                if (typeof (typeName) == "string") {
                    if (egret.is(component, typeName)) {
                        components.push(component);
                    }
                } else {
                    if (component instanceof typeName) {
                        components.push(component);
                    }
                }
            }

            return components;
        }

        public update() {
            this.updateLists();
            for (let i = 0; i < this._components.length; i++) {
                let updatableComponent = this._components[i];

                if (updatableComponent.enabled &&
                    (updatableComponent.updateInterval == 1 ||
                        Time.frameCount % updatableComponent.updateInterval == 0))
                    updatableComponent.update();
            }
        }

        public onEntityTransformChanged(comp: transform.Component) {
            for (let i = 0; i < this._components.length; i++) {
                if (this._components[i].enabled)
                    this._components[i].onEntityTransformChanged(comp);
            }

            for (let i = 0; i < this._componentsToAdd.length; i++) {
                if (this._componentsToAdd[i].enabled)
                    this._componentsToAdd[i].onEntityTransformChanged(comp);
            }
        }

        public onEntityEnabled() {
            for (let i = 0; i < this._components.length; i++)
                this._components[i].onEnabled();
        }

        public onEntityDisabled() {
            for (let i = 0; i < this._components.length; i++)
                this._components[i].onDisabled();
        }

        public debugRender(){
            for (let i = 0; i < this._components.length; i ++){
                if (this._components[i].enabled)
                    this._components[i].debugRender();
            }
        }
    }
}
