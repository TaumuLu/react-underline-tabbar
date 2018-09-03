import React, { Component } from 'react'
import { TouchableOpacity, ScrollView as RNScrollView, Animated, Easing, View, Text } from 'react-native'

import { size, keys, get } from './utils'
import TabBarHOC from './decorators/tab-bar-hoc'

const RNScrollViewStyle = {
  flex: 1,
  flexDirection: 'row',
  position: 'relative',
}

const Button = (props) => {
  return (
    <TouchableOpacity {...props} />
  )
}

class ScrollView extends Component {
  render() {
    const { onRef, style, ...otherProps } = this.props
    const extraProps = {}
    if (onRef) {
      extraProps.ref = onRef
    }

    return (
      <RNScrollView
        style={RNScrollViewStyle}
        contentContainerStyle={style}
        showsHorizontalScrollIndicator={false}
        scrollEventThrottle={1}
        bounces={false}
        {...extraProps}
        {...otherProps}
      />
    )
  }
}

const AnimatedView = Animated.View

const Style = {
  containerStyle: {
  },
  scrollViewStyle: {
  },
  tabStyle: {
  },
}

const matrixKey = 'matrix'


@TabBarHOC({ matrixKey, Button, ScrollView, AnimatedView, Animated, Easing, View, Text, Style })
export default class TabBar extends Component {
  _getStyle() {
    const { tabs } = this.props
    const tabKeys = keys(this.tabState)
    const tabStateDone = size(tabs) === size(tabKeys)
    const containerWidth = get(this.containerLayout, 'width')
    let flex = 1
    if (tabStateDone && containerWidth) {
      const tabTotalWidth = tabKeys.reduce((count, key) => {
        const { width = 0 } = this.tabState[key] || {}
        return count + width
      }, 0)
      if (tabTotalWidth > containerWidth) {
        flex = undefined
      }
    }

    return {
      scrollViewStyle: {
        flex,
      },
    }
  }

  _getScrollValue({ value }) {
    const { width } = this.props
    return value / width
  }
}
