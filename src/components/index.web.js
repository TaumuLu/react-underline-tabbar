import React, { Component } from 'react'
import Animated from 'animated/lib/targets/react-dom'
import Easing from 'animated/lib/Easing'
import { mergeStyle, handleStyle } from '../utils'


const defaultStyle = { display: 'flex', flexDirection: 'row', boxSizing: 'border-box' }
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
        style={handleStyle(mergeStyle(defaultStyle, style))}
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

    onLayout({
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
      style={handleStyle(mergeStyle(defaultStyle, style))}
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
      style={handleStyle(mergeStyle(defaultStyle, textDefaultStyle, style))}
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

  scrollTo = ({ x, y, animated }) => {
    const { vertical } = this.props
    const scrollKey = vertical ? 'scrollTop' : 'scrollLeft'
    const value = vertical ? y : x

    this._scrollView[scrollKey] = Math.abs(value)
  }

  render() {
    const { style, children } = this.props

    return (
      <div
        ref={this.setRef}
        style={handleStyle(mergeStyle(defaultStyle, style))}
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
    flex: 1,
    display: 'flex',
    overflowX: 'hidden',
    overflowY: 'hidden',
    WebkitOverflowScrolling: 'touch',
  },
  underlineStyle: {
  },
  tabStyle: {
    display: 'flex',
    // flex: '0 0 auto',
  },
}

const matrixKey = 'matrix3d'


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
