import { PureComponent } from 'react'
import { TabBarHOC } from './decorators'


@TabBarHOC
export default class TabBar extends PureComponent {
  _getStyle() {
    const { vertical } = this.props
    let scrollViewflex
    let tabStyle = {
      flex: undefined,
    }
    let containerStyle = {}
    if (this.isScrollTabBar !== null) {
      if (this.isScrollTabBar) {
        scrollViewflex = undefined
        tabStyle.flex = undefined
      } else {
        scrollViewflex = 1
        tabStyle = {}
      }
    } else {
      containerStyle = {
        opacity: 0,
      }
    }
    const linePos = vertical ? 'right' : 'bottom'

    return {
      containerStyle,
      scrollViewStyle: {
        flex: scrollViewflex,
      },
      underlineStyle: {
        [linePos]: 0,
      },
      tabStyle,
    }
  }
}
