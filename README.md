## 简介
1. 以`workbench.js`作为主要场景类，业务均由此作为门面对象
2. `zrender-flow.vue` 是在vue环境下对`workbench`的封装
3. `HelloWorld.vue`是使用示例


## TODO LIST
- 框选整体操作
  - 移动
  - 移除
- 连线
  - √ 线段绘制
  - √ 箭头绘制
  - √ 边缘贴合
  - √ 线段计算
  - √ 固定接头
  - √ 移动方块重新计算
- 右键菜单
  - 菜单对象生成
  - 菜单格式通过Target导入
  - 菜单调用通过event隔离
- 运行时状态更新
  - vue-watch
  - workbench 执行
- √ 存储、加载
- √ 模式切换
  - √ 选择box，但是不能创建新连线、调整大小、移动
  - √ 选择line ，但是不能调整位置、链接对象
---

## Bug 
