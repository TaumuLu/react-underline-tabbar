import { Component } from 'react'
import { TabBarHOC } from './decorators'


@TabBarHOC
export default class TabBar extends Component {
  _getStyle() {
    const { vertical } = this.props
    let flex = 1
    if (this.isScrollTabBar) {
      flex = undefined
    }
    const linePos = vertical ? 'right' : 'bottom'

    return {
      scrollViewStyle: {
        flex,
      },
      underlineStyle: {
        [linePos]: 0,
      },
    }
  }
}
