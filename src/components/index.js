
import React, { Component } from 'react'
import { TouchableOpacity, ScrollView as RNScrollView, Animated, Easing, View, Text } from 'react-native'


const RNScrollViewStyle = {
  flex: 1,
  position: 'relative',
}

const Button = (props) => {
  return (
    <TouchableOpacity {...props} />
  )
}

class ScrollView extends Component {
  render() {
    const { onRef, style, vertical, ...otherProps } = this.props
    const extraProps = {}
    if (onRef) {
      extraProps.ref = onRef
    }
    extraProps.horizontal = !vertical
    const flexDirection = vertical ? 'column' : 'row'

    return (
      <RNScrollView
        style={[RNScrollViewStyle, { flexDirection }]}
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
  underlineStyle: {
  },
  tabStyle: {
  },
}

const matrixKey = 'matrix'


export {
  matrixKey,
  Button,
  ScrollView,
  AnimatedView,
  Animated,
  Easing,
  View,
  Text,
  Style
}
