import { PureComponent } from 'react'
import { TabBarHOC } from './decorators'

const viewInitialStyle = {
  backgroundColor: 'transparent',
}

const textInitialStyle = {
  color: 'transparent',
  ...viewInitialStyle,
}

@TabBarHOC
export default class TabBar extends PureComponent {
  _getStyle() {
    const { vertical } = this.props
    let scrollViewflex
    let tabStyle = {
      flex: undefined,
    }
    let tabTextStyle = {}
    let tabTextActiveStyle = {}
    let tabActiveStyle = {}
    let underlineStyle = {}
    if (this.isScrollTabBar !== null) {
      if (this.isScrollTabBar) {
        scrollViewflex = undefined
        tabStyle.flex = undefined
      } else {
        scrollViewflex = 1
        tabStyle = {}
      }
    } else {
      tabStyle = viewInitialStyle
      tabActiveStyle = viewInitialStyle
      underlineStyle = viewInitialStyle
      tabTextStyle = textInitialStyle
      tabTextActiveStyle = textInitialStyle
    }
    const linePos = vertical ? 'right' : 'bottom'

    return {
      scrollViewStyle: {
        flex: scrollViewflex,
      },
      underlineStyle: {
        ...underlineStyle,
        [linePos]: 0,
      },
      tabStyle,
      tabActiveStyle,
      tabTextStyle,
      tabTextActiveStyle,
    }
  }
}
