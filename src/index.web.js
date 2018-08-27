import React, { Component } from 'react'
import Animated from 'animated/lib/targets/react-dom'

import { mergeStyle } from './utils'

import TabBarHOC from './decorators/tab-bar-hoc'


const defaultStyle = { display: 'flex', flexDirection: 'row' }
const textDefaultStyle = { whiteSpace: 'nowrap' }

class Button extends Component {
  render() {
    const { onPress, onLayout, style, ...otherProps } = this.props
    const extraProps = {}
    if (onPress) {
      extraProps.onClick = onPress
    }
    if (onLayout) {
      extraProps.ref = ref(onLayout)
    }

    return (
      <div
        style={mergeStyle(style, defaultStyle)}
        {...extraProps}
        {...otherProps}
      />
    )
  }
}

const AnimatedView = Animated.div

const ref = onLayout => (dom) => {
  if (dom && onLayout) {
    const { offsetLeft, offsetTop, offsetWidth, offsetHeight } = dom

    return onLayout({
      nativeEvent: {
        layout: {
          height: offsetHeight,
          width: offsetWidth,
          x: offsetLeft,
          y: offsetTop,
        },
      },
    })
  }
}

const View = (props) => {
  const { onLayout, style, ...otherProps } = props
  const extraProps = {}
  if (onLayout) {
    extraProps.ref = ref(onLayout)
  }

  return (
    <div
      style={mergeStyle(style, defaultStyle)}
      {...extraProps}
      {...otherProps}
    />
  )
}

const Text = (props) => {
  const { onLayout, style, ...otherProps } = props
  const extraProps = {}
  if (onLayout) {
    extraProps.ref = ref(onLayout)
  }

  return (
    <span
      style={mergeStyle(style, defaultStyle, textDefaultStyle)}
      {...extraProps}
      {...otherProps}
    />
  )
}

class ScrollView extends Component {
  constructor(props) {
    super(props)

    const pos = new Animated.Value(0)
    this.state = {
      pos,
    }
  }

  setRef = (dom) => {
    if (dom) {
      this._scrollView = dom
      const { onRef, onContentSizeChange } = this.props
      if (onRef) onRef(this)

      const { scrollWidth: width, scrollHeight: height } = dom
      onContentSizeChange && onContentSizeChange(width, height)
    }
  }

  _onScroll = (event) => {
    const { scrollLeft: x, scrollTop: y, scrollWidth: width, scrollHeight: height, offsetWidth, offsetHeight } = event.currentTarget
    const { onScroll } = this.props

    const nativeEvent = {
      contentOffset: { x, y },
      contentSize: { width, height },
      layoutMeasurement: { width: offsetWidth, height: offsetHeight },
    }
    if (onScroll) onScroll({ nativeEvent })
  }

  scrollTo = ({ x, animated }) => {
    this._scrollView.scrollLeft = Math.abs(x)
  }

  render() {
    const { style, children } = this.props

    return (
      <div
        ref={this.setRef}
        style={style}
        onScroll={this._onScroll}
        className='tabBar_scrollView'
      >
        {children}
      </div>
    )
  }
}

const Style = {
  containerStyle: {
    display: 'flex',
  },
  scrollViewStyle: {
    display: 'flex',
    overflowX: 'scroll',
    overflowY: 'hidden',
    WebkitOverflowScrolling: 'touch',
  },
  tabStyle: {
    display: 'flex',
  },
}

const matrixKey = 'matrix3d'


@TabBarHOC({ matrixKey, Button, ScrollView, Animated, AnimatedView, View, Text, Style })
export default class TabBar extends Component {

  _getStyle() {
    const { scrollEnabled } = this.props
    return {
      scrollViewStyle: {
        overflowX: scrollEnabled ? 'scroll' : 'hidden',
      },
    }
  }

  _getScrollValue({ value }) {
    const { width } = this.props
    return -(value / width)
  }
}
