import React from 'react'

import { size, keys, get, createTranslateXScaleX, transformOrigin, mergeStyle, getMergeObject } from '../utils'
import { propTypes, defaultProps } from '../prop-types'


export default function ScrollPageHOC({ matrixKey, Button, ScrollView, Animated, Easing, AnimatedView, View, Text, Style }) {
  return (WrappedComponent) => {
    return class TabBarHOC extends WrappedComponent {
      static defaultProps = defaultProps
      static propTypes = propTypes

      constructor(props) {
        super(props)
        const { activeTab, pos } = props

        const scrollValue = new Animated.Value(activeTab)
        this.state = {
          scrollValue,
        }

        this.tabState = {}
        this.initialSetupWasDone = false

        this.widthCollection = null
        this.offsetCollection = null
        this.scrollOffsetsCollection = null

        // 是否传入动画值，传入此值可借此监听做同步动画
        this.hasPos = !!pos
        if (pos) {
          const isAnimated = pos instanceof Animated.Value
          if (!isAnimated) {
            console.warn('pos is not instanceof Animated')
            this.hasPos = false
          }
        }
      }

      componentDidMount() {
        const { hasAnimation, pos } = this.props

        if (hasAnimation) {
          const { scrollValue } = this.state
          // 未传入动画值则使用自己的动画值做监听
          const animatedValue = this.hasPos ? pos : scrollValue
          animatedValue.addListener((params) => {
            const { width } = this.props
            if (width) {
              const value = this.hasPos ? this._getScrollValue(params) : params.value
              this.handleScrolling({ value })
            }
          })
        }
      }

      componentWillReceiveProps(nextProps) {
        const { activeTab } = this.props

        if (!this.hasPos && activeTab !== nextProps.activeTab) {
          this.handleScrolling({ value: nextProps.activeTab })
        }
      }

      _scrollViewRef = (node) => {
        this.scrollView = node
      }

      _setUnderlineRef = (ref) => {
        this.underlineRef = ref
      }

      _onContainerLayout = ({ nativeEvent }) => {
        this.containerLayout = nativeEvent.layout
        this.checkMeasures()
      }

      _onContentSizeChange = (width, height) => {
        const { width: prevWidth, height: prevHeight } = this.scrollViewLayout || {}
        const isUpdate = prevWidth !== width || prevHeight !== height

        this.scrollViewLayout = { width, height, x: 0, y: 0 }
        this.checkMeasures(isUpdate)
      }

      onTabLayout({ nativeEvent }, page) {
        const { x, y, width, height } = nativeEvent.layout
        this.tabState[page] = { x, y, width, height }

        this.checkMeasures()
      }

      checkMeasures = (isUpdate) => {
        const { tabs } = this.props
        const currentTabsLen = size(tabs)
        const isGtMinLimit = currentTabsLen > 1
        const tabStateDone = currentTabsLen === size(keys(this.tabState))

        if (isGtMinLimit && get(this.containerLayout, 'width') && get(this.scrollViewLayout, 'width') && tabStateDone) {
          // 滚动尺寸发生变化时更新动画映射值
          if (!this.initialSetupWasDone || isUpdate) {
            this.calculateInterpolations()
          }

          if (!this.initialSetupWasDone) {
            this.initialSetupWasDone = true
            const { activeTab } = this.props

            this.handleScrolling({ value: activeTab })
            this.forceUpdate()
          }
        }
      };

      handleScrolling = ({ value }) => {
        const dx = get(this.offsetCollection, '_interpolation', () => 0)(value)
        const scaleX = get(this.widthCollection, '_interpolation', () => 0)(value)

        this.applyTransformToUnderline(scaleX, dx)
        if (this.scrollOffsetsCollection) {
          const scrollOffset = get(this.scrollOffsetsCollection, '_interpolation', () => 0)(value)

          if (this.scrollView) {
            this._scrollOffsetX = scrollOffset
            this.scrollView.scrollTo({ x: scrollOffset, animated: false })
          }
        }
      }

      applyTransformToUnderline(scaleX, dx) {
        if (!this.underlineRef) return

        // const matrix = createTranslateXScaleX(scaleX, dx)
        // transformOrigin(matrix, { x: -0.5, y: 0, z: 0 })
        const width = scaleX
        const translateX = dx
        this.underlineRef.setNativeProps({
          style: {
            width,
            transform: [
              {
                translateX,
                // [matrixKey]: matrix,
              },
            ],
          },
        })
      }

      calculateInterpolations = () => {
        const inputRange = keys(this.tabState).map(Number)
        const len = size(inputRange)
        const outputRangeLeft = []
        const outputRangeWidth = []
        const outputRangeScroll = [0]
        const { scrollValue } = this.state

        inputRange.forEach((key) => {
          outputRangeLeft.push(this.tabState[key].x)
          outputRangeWidth.push(this.tabState[key].width)
        })
        if (len < 2) {
          inputRange.push(1)
          outputRangeLeft.push(0)
          outputRangeWidth.push(0)
        }
        this.offsetCollection = scrollValue.interpolate({
          inputRange,
          outputRange: outputRangeLeft,
        })
        this.widthCollection = scrollValue.interpolate({
          inputRange,
          outputRange: outputRangeWidth,
        })
        const { scrollPosition } = this.props

        const containerWidth = get(this.containerLayout, 'width')
        const scrollWidth = get(this.scrollViewLayout, 'width')
        let maxScrollOffset = scrollWidth - containerWidth
        if (maxScrollOffset < 0) maxScrollOffset = 0

        inputRange.forEach((key, index) => {
          if (index === 0) return

          const tabLeft = outputRangeLeft[index]
          const tabWidth = outputRangeWidth[index]

          // const nextTabLeft = outputRangeLeft[index + 1] || scrollWidth
          // 计算tab间的间距
          // const tabMargin = nextTabLeft - (tabLeft + tabWidth)
          // 默认定位到中间
          let scrollOffset = (tabLeft - (containerWidth / 2)) + (tabWidth / 2)
          if (scrollPosition === 'left') {
            const prevTabLeft = outputRangeLeft[index - 1]
            // const prevTabWidth = outputRangeWidth[index - 1]

            scrollOffset = prevTabLeft
          } else if (scrollPosition === 'right') {
            const nextTabLeft = outputRangeLeft[index + 1] || tabLeft + tabWidth
            const nextTabWidth = outputRangeWidth[index + 1] || 0
            const totalLength = nextTabLeft + nextTabWidth

            scrollOffset = totalLength - containerWidth
          }

          if (scrollOffset < 0) scrollOffset = 0
          if (scrollOffset > maxScrollOffset) scrollOffset = maxScrollOffset

          outputRangeScroll.push(scrollOffset)
        })

        if (scrollWidth <= containerWidth) {
          this.scrollOffsetsCollection = scrollValue.interpolate({
            inputRange: [-1, 0],
            outputRange: [-40, 0],
            extrapolate: 'clamp',
          })
        } else {
          this.scrollOffsetsCollection = scrollValue.interpolate({
            inputRange: [-1, ...inputRange],
            outputRange: [-40, ...outputRangeScroll],
          })
        }
      }

      _onScroll = ({ nativeEvent }) => {
        const { contentOffset } = nativeEvent
        const { x, y } = contentOffset || {}

        this._scrollOffsetX = x
        this._scrollOffsetY = y
      }

      renderUnderline(style) {
        const { hasUnderline } = this.props
        if (!hasUnderline) return null

        return (
          <AnimatedView ref={this._setUnderlineRef} style={style} />
        )
      }

      _onPress = (page, tab) => {
        const { goToPage, activeTab } = this.props
        const { scrollValue } = this.state
        if (page === activeTab) return

        // this._direction = page > activeTab ? 'next' : 'prev'
        if (!this.hasPos) {
          const { duration } = this.props
          const toValue = page
          const easing = Easing.out(Easing.ease)
          Animated.timing(scrollValue, { toValue, duration, easing }).start()
        } else {
          scrollValue.setValue(page)
        }

        goToPage(page, tab)
      }

      renderTab = (tab, page) => {
        const { activeTab, renderTab } = this.props
        const isTabActive = activeTab === page
        const onPress = () => this._onPress(page, tab)
        const onLayout = event => this.onTabLayout(event, page)

        if (renderTab) {
          return renderTab({ tab, page, onPress, onLayout, isTabActive })
        }
        const { label } = tab
        const { tabStyle, tabActiveStyle, tabTextStyle, tabTextActiveStyle } = this._getStyle()

        return (
          <Button
            style={mergeStyle(tabStyle, isTabActive ? tabActiveStyle : {})}
            key={page}
            onPress={onPress}
            onLayout={onLayout}
          >
            <Text
              style={mergeStyle(tabTextStyle, isTabActive ? tabTextActiveStyle : {})}
            >
              {label}
            </Text>
          </Button>
        )
      }

      _getStyle(isClearCache) {
        if (isClearCache) this.Style = null
        if (this.Style) return this.Style

        const { style, scrollViewStyle, underlineStyle, tabStyle, tabActiveStyle, tabTextStyle, tabTextActiveStyle } = this.props

        const baseStyles = getMergeObject(defaultStyle, {
          containerStyle: style,
          scrollViewStyle,
          underlineStyle,
          tabStyle,
          tabActiveStyle,
          tabTextStyle,
          tabTextActiveStyle,
        })

        const commonStyles = getMergeObject(baseStyles, commonStyle)
        const mergeStyles = getMergeObject(commonStyles, Style)
        this.Style = getMergeObject(mergeStyles, super._getStyle())

        return this.Style
      }

      render() {
        const { tabs, scrollEnabled } = this.props
        const { containerStyle, scrollViewStyle, underlineStyle } = this._getStyle(true)

        return (
          <View
            style={containerStyle}
            onLayout={this._onContainerLayout}
          >
            <ScrollView
              style={scrollViewStyle}
              onRef={this._scrollViewRef}
              onContentSizeChange={this._onContentSizeChange}
              scrollEnabled={scrollEnabled}
              onScroll={this._onScroll}
              horizontal
            >
              {tabs.map(this.renderTab)}
              {this.renderUnderline(underlineStyle)}
            </ScrollView>
          </View>
        )
      }
    }
  }
}

const defaultStyle = {
  containerStyle: {
    borderBottomWidth: 1,
    borderTopWidth: 0,
    borderLeftWidth: 0,
    borderRightWidth: 0,
    borderBottomColor: '#d2d2d2',
    borderStyle: 'solid',
  },
  tabTextActiveStyle: {
    color: 'navy',
  },
  underlineStyle: {
    backgroundColor: 'navy',
    height: 2,
    bottom: 0,
    padding: 0,
  },
  tabStyle: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    height: 50,
  },
  scrollViewStyle: {
    justifyContent: 'space-between',
  },
}

const commonStyle = {
  containerStyle: {
    overflow: 'hidden',
    flexDirection: 'row',
    justifyContent: 'flex-start',
  },
  underlineStyle: {
    position: 'absolute',
    width: 1,
  },
  scrollViewStyle: {
    flexDirection: 'row',
    position: 'relative',
  },
}
