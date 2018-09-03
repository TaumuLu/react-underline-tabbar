# react-underline-tabbar

**选项卡，下划线跟随，自动滚动**  

## 安装
```
npm install react-underline-tabbar --save
```

## 简介
支持RN端和的web端的tabs组件  
提供下划线跟随选中tab，及适应其tab的宽度  
可以传入Animated动画值监听做动作同步，未传入自身也提供动画值，可以设置持续时间  
可以依据自身需要传入相关style确定容器样式  

## 注意
基于[react-native-underline-tabbar](https://github.com/Slowyn/react-native-underline-tabbar)RN组件库，借鉴了下划线部分的动画处理，在此基础上优化了滚动和onLayout的代码，并开发了web组件，感兴趣的可以去看下  
可以配合react-scroll-paged-view来做tabs视图同步动画  

## 使用
结合可以配合react-scroll-paged-view使用
```javascript
import ScrollPagedView from 'react-scroll-paged-view'
import InsideScrollView from './InsideScrollView'

...
    render() {
        return (
          <View style={styles.containerWrap}>
            <ViewPaged
              vertical={false}
              renderHeader={params => (
                <TabBar
                  tabs={this.tabs}
                  tabStyle={styles.tab}
                  {...params}
                />
              )}
            >
              {this.tabs.map(({ label, text }, index) => (
                <Page key={index} tabLabel={{ label }} label={text || label}/>
              ))}
            </ViewPaged>
        )
    }
...
```

## Export module
- default - TabBar

## 属性
| Name | propType | default value | description |
| --- | --- | --- | --- |
| tabs | array | [] | tab信息数组，至少提供label属性展示 |
| pos | animated | null | animated值，用作监听 |
| width | number | 0 | 滚动视图的width |
| goToPage | function | noop | 切换tab函数，参数为tab索引 |
| activeTab | number | 0 | 当前激活的tab索引 |
| renderTab | function/element | null | 渲染tab组件 |
| hasUnderline | bool | true | 是否有下划线 |
| scrollEnabled | bool | true | 是否可以手动滚动tabBar |
| hasAnimation | bool | true | 切换tab时是否有动画 |
| duration | number | 400 | 未提供pos时的动画持续时间(以毫秒为单位) |
| style | object | {} | 最外层容器样式 |
| scrollViewStyle | object | {} | 滚动容器样式 |
| underlineStyle | object | {} | 下划线样式 |
| tabStyle | object | {} | tab项样式 |
| tabActiveStyle | object | {} | 激活的tab项样式 |
| tabTextStyle | object | {} | tab项文字样式 |
| tabTextActiveStyle | object | {} | 激活的tab项文字样式 |

## TODO
- [x] 优化滚动动画代码，去除Animated.divide的依赖（web端animated库不支持）
- [x] 提供web端版本，统一props，表现和RN一致
- [x] 提供自身动画处理，在未传入动画值时
- [ ] 修复手动滚动后再次切换动画违和的问题
- [ ] 提供友好的不带滚动的tab形式
- [ ] 更多props配置

## Changelog
- 0.1.*
