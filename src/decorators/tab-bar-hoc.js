import React from 'react'
import { size, keys, get, createTranslateXScaleX, transformOrigin, mergeStyle, getMergeObject } from '../utils'

import { propTypes, defaultProps } from '../prop-types'


export default function ScrollPageHOC({ matrixKey, Button, ScrollView, Animated, AnimatedView, View, Text, Style }) {
  return (WrappedComponent) => {
    return class TabBarHOC extends WrappedComponent {
      static defaultProps = defaultProps
      static propTypes = propTypes

      constructor(props) {
        super(props)
        const { activeTab } = props

        const scrollValue = new Animated.Value(activeTab)
        this.state = {
          scrollValue,
        }

        this.tabState = {}
        this.initialSetupWasDone = false

        this.widthCollection = null
        this.offsetCollection = null
        this.scrollOffsetsCollection = null
      }

      componentDidMount() {
        const { hasAnimation, pos } = this.props
        if (!hasAnimation) return

        const isAnimated = pos instanceof Animated.Value
        if (!isAnimated) {
          console.warn('pos is not instanceof Animated')
          return
        }

        pos.addListener((params) => {
          const { width } = this.props
          if (width) {
            const value = this._getScrollValue(params)
            this.handleScrolling({ value })
          }
        })
      }

      componentWillReceiveProps(nextProps) {
        const { activeTab, hasAnimation } = this.props

        if (!hasAnimation && activeTab !== nextProps.activeTab) {
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
        this.scrollViewLayout = { width, height, x: 0, y: 0 }
        this.checkMeasures()
      }

      onTabLayout({ nativeEvent }, page) {
        const { x, y, width, height } = nativeEvent.layout
        this.tabState[page] = { x, y, width, height }

        this.checkMeasures()
      }

      checkMeasures = () => {
        const { tabs } = this.props
        const tabStateDone = size(tabs) === size(keys(this.tabState))

        if (get(this.containerLayout, 'width') && get(this.scrollViewLayout, 'width') && tabStateDone) {
          if (!this.initialSetupWasDone) {
            const { activeTab } = this.props

            this.calculateInterpolations()
            this.handleScrolling({ value: activeTab })
            this.initialSetupWasDone = true
          }
        }
      };

      handleScrolling = ({ value }) => {
        const { hasAnimation } = this.props
        const dx = get(this.offsetCollection, '_interpolation', () => 0)(value)
        const scaleX = get(this.widthCollection, '_interpolation', () => 0)(value)

        this.applyTransformToUnderline(scaleX, dx)
        if (hasAnimation && this.scrollOffsetsCollection) {
          const scrollOffset = get(this.scrollOffsetsCollection, '_interpolation', () => 0)(value)

          if (this.scrollView) {
            this._scrollOffsetX = scrollOffset
            this.scrollView.scrollTo({ x: scrollOffset, animated: false })
          }
        }
      }

      applyTransformToUnderline(scaleX, dx) {
        if (!this.underlineRef) return

        const matrix = createTranslateXScaleX(scaleX, dx)
        transformOrigin(matrix, { x: -0.5, y: 0, z: 0 })
        this.underlineRef.setNativeProps({
          style: {
            transform: [
              {
                [matrixKey]: matrix,
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
        const containerWidth = get(this.containerLayout, 'width')
        const scrollWidth = get(this.scrollViewLayout, 'width')
        const { scrollValue } = this.state
        let maxScrollOffset = scrollWidth - containerWidth
        if (maxScrollOffset < 0) maxScrollOffset = 0

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

        inputRange.forEach((key, index) => {
          if (index === 0) return

          const tabLeft = outputRangeLeft[index]
          const tabWidth = outputRangeWidth[index]
          // const nextTabLeft = outputRangeLeft[index + 1] || scrollWidth
          // 计算tab间的间距
          // const tabMargin = nextTabLeft - (tabLeft + tabWidth)
          // 定位到中间
          let scrollOffset = (tabLeft - (containerWidth / 2)) + (tabWidth / 2)

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

      // _onScroll = ({ nativeEvent }) => {
      //   const { contentOffset } = nativeEvent
      //   const { x, y } = contentOffset || {}

      //   this._scrollOffsetX = x
      //   this._scrollOffsetY = y
      // }

      renderUnderline(style) {
        const { hasUnderline } = this.props
        if (!hasUnderline) return null

        return (
          <AnimatedView ref={this._setUnderlineRef} style={style} />
        )
      }

      _onPress = (page) => {
        const { goToPage, activeTab } = this.props
        const { scrollValue } = this.state
        if (page === activeTab) return

        this._direction = page > activeTab ? 'next' : 'prev'
        scrollValue.setValue(page)
        goToPage(page)
      }

      renderTab = (tab, page) => {
        const { activeTab, renderTab } = this.props
        const isTabActive = activeTab === page
        const onPress = () => this._onPress(page)
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

        const { style, scrollViewStyle, contentContainerStyle, underlineStyle, tabStyle, tabActiveStyle, tabTextStyle, tabTextActiveStyle } = this.props

        const baseStyles = getMergeObject(defaultStyle, {
          containerStyle: style,
          scrollViewStyle,
          contentContainerStyle,
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
        const { containerStyle, scrollViewStyle, contentContainerStyle, underlineStyle } = this._getStyle(true)

        return (
          <View
            style={containerStyle}
            onLayout={this._onContainerLayout}
          >
            <ScrollView
              style={scrollViewStyle}
              contentContainerStyle={contentContainerStyle}
              onContentSizeChange={this._onContentSizeChange}
              onRef={this._scrollViewRef}
              scrollEnabled={scrollEnabled}
              // onScroll={this._onScroll}
              showsHorizontalScrollIndicator={false}
              scrollEventThrottle={1}
              bounces={false}
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
    borderBottomColor: '#d2d2d2',
  },
  tabActiveStyle: {

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
    // flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    height: 50,
    marginLeft: 10,
    marginRight: 10,
  },
}

const commonStyle = {
  containerStyle: {
    // flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-start',
  },
  underlineStyle: {
    position: 'absolute',
    width: 1,
  },
  scrollViewStyle: {
    flex: 1,
    flexDirection: 'row',
    position: 'relative',
  },
  tabStyle: {
  },
}
