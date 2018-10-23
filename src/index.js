import { Component } from 'react'
import { size, keys, get } from './utils'
import { TabBarHOC } from './decorators'


@TabBarHOC
export default class TabBar extends Component {
  _getStyle() {
    const { tabs, vertical } = this.props
    const getKey = vertical ? 'height' : 'width'
    const tabKeys = keys(this.tabState)
    const tabStateDone = size(tabs) === size(tabKeys)
    const containerValue = get(this.containerLayout, getKey)
    let flex = 1
    if (tabStateDone && containerValue) {
      const tabTotalValue = tabKeys.reduce((count, key) => {
        const { width = 0, height = 0 } = this.tabState[key] || {}
        const value = vertical ? height : width
        return count + value
      }, 0)
      if (tabTotalValue > containerValue) {
        flex = undefined
      }
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
