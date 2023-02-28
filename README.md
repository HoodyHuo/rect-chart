
# 简介
1. 以`workbench.js`作为主要场景类，业务均由此作为门面对象
2. `zrender-flow.vue` 是在vue环境下对`workbench`的封装
3. `HelloWorld.vue`是使用示例


# TODO LIST
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

# 说明
1. 以`src/index.ts`文件为包起点，所有必要导出的内容从此处导出
2. typescript 中的类别文件，会自动生成`*.d.ts`文件

# 引用方式
## 1. 通过git仓库引用
````cmd
npm install git+http://200.200.180.254:13000/huodian/FlowChart
````

## 2. 本地引用
本质上本地引用是npm在全局依赖里面创建了一个快捷方式，指向模块，然后再到使用模块的项目连接，再次创建一个快捷方式，指向全局依赖。
```bash
# 1.克隆本项目到本地
git clone http://200.200.180.254:13000/huodian/FlowChart

# 2. 进入项目目录
cd FlowChart

# 3.创建全局连接，约等于 npm install -g FlowChart
npm link

# 4.到需要使用的项目中比如 vue-admin
cd .../../vue-admin

# 5.连接到模块 约等于 npm install FlowChart
npm link FlowChart
```