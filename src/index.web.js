import { Component } from 'react'
import { TabBarHOC } from './decorators'


@TabBarHOC
export default class TabBar extends Component {
  _getStyle() {
    const { scrollEnabled, vertical } = this.props
    const overflowKey = vertical ? 'overflowY' : 'overflowX'
    const overflowValue = scrollEnabled ? 'scroll' : 'hidden'

    const paddingKey = vertical ? 'paddingRight' : 'paddingBottom'
    const marginKey = vertical ? 'marginRight' : 'marginBottom'
    const linePos = vertical ? 'right' : 'bottom'

    return {
      scrollViewStyle: {
        [overflowKey]: overflowValue,
        // 用来抵消隐藏滚动条
        [paddingKey]: 10,
        [marginKey]: -10,
      },
      underlineStyle: {
        [linePos]: 10,
      },
    }
  }

  _getScrollValue({ value }, propsValue) {
    return -(value / propsValue)
  }
}
