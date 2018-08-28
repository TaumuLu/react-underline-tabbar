import React, { Component } from 'react'
import { TouchableOpacity, ScrollView as RNScrollView, Animated, Easing, View, Text } from 'react-native'

import TabBarHOC from './decorators/tab-bar-hoc'

const Button = (props) => {
  return (
    <TouchableOpacity {...props} />
  )
}

class ScrollView extends Component {
  render() {
    const { onRef, ...otherProps } = this.props
    const extraProps = {}
    if (onRef) {
      extraProps.ref = onRef
    }

    return (
      <RNScrollView
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
    return {}
  }

  _getScrollValue({ value }) {
    const { width } = this.props
    return value / width
  }
}
