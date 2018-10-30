import React from 'react'
import { propTypes, defaultProps } from '../prop-types'
import { size, keys, get, createTranslateXScaleX, transformOrigin, mergeStyle, getMergeObject } from '../utils'
import { matrixKey, Button, ScrollView, Animated, Easing, AnimatedView, View, Text, Style } from '../components'


export default function ScrollPageHOC(WrappedComponent) {
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
      this.isScrollTabBar = false
      this._isOnPress = false

      this.widthCollection = null
      this.offsetCollection = null
      this.scrollOffsetsCollection = null

      this.containerLayout = null
      this.scrollViewLayout = null

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
        animatedValue.addListener((params = {}) => {
          const { width, height, vertical } = this.props
          const propsValue = vertical ? height : width
          if (propsValue) {
            const value = this.hasPos ? params.value / propsValue : params.value
            this.handleScrolling({ value })
          }
        })
      }
    }

    componentWillReceiveProps(nextProps) {
      const { activeTab, hasAnimation } = this.props
      const nextActiveTab = nextProps.activeTab

      if (!this._isOnPress && activeTab !== nextActiveTab) {
        if (hasAnimation) {
          if (!this.hasPos) {
            this._updateAnimated(nextActiveTab)
          }
        } else {
          this.handleScrolling({ value: nextActiveTab })
        }
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

      if (isGtMinLimit && this.containerLayout && this.scrollViewLayout && tabStateDone) {
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
      const dPos = get(this.offsetCollection, '_interpolation', () => 0)(value)
      const scaleValue = get(this.widthCollection, '_interpolation', () => 0)(value)

      this.applyTransformToUnderline(scaleValue, dPos)
      if (this.scrollOffsetsCollection) {
        const scrollOffset = get(this.scrollOffsetsCollection, '_interpolation', () => 0)(value)

        if (this.scrollView) {
          const { vertical } = this.props
          const key = vertical ? 'y' : 'x'

          this._scrollOffsetX = scrollOffset
          this.scrollView.scrollTo({ [key]: scrollOffset, animated: false })
        }
      }
    }

    applyTransformToUnderline(scaleValue, dPos) {
      if (!this.underlineRef) return
      const { vertical, underlineStyle = {}, isAutoSize = false } = this.props

      // const matrix = createTranslateXScaleX(scaleValue, dPos)
      // transformOrigin(matrix, { x: -0.5, y: 0, z: 0 })
      const valueKey = vertical ? 'height' : 'width'
      const posKey = vertical ? 'translateY' : 'translateX'
      const fixedSize = get(underlineStyle, valueKey)
      let sizeValue = scaleValue
      let posValue = dPos
      // 固定尺寸
      const isReplace = isAutoSize ? !this.isScrollTabBar : true
      if (isReplace && fixedSize && fixedSize < scaleValue) {
        sizeValue = fixedSize
        const diffValue = (scaleValue - fixedSize) / 2
        posValue = dPos + diffValue
      }

      this.underlineRef.setNativeProps({
        style: {
          [valueKey]: sizeValue,
          transform: [
            {
              [posKey]: posValue,
              // [matrixKey]: matrix,
            },
          ],
        },
      })
    }

    calculateInterpolations = () => {
      const inputRange = keys(this.tabState).map(Number)
      const len = size(inputRange)
      const outputRangePos = []
      const outputRangeValue = []
      const outputRangeScroll = [0]
      const { scrollValue } = this.state
      const { scrollPosition, vertical } = this.props
      const getKey = vertical ? 'height' : 'width'

      inputRange.forEach((key) => {
        const { x, y, width = 0, height = 0 } = this.tabState[key]
        outputRangePos.push(vertical ? y : x)
        outputRangeValue.push(vertical ? height : width)
      })
      if (len < 2) {
        inputRange.push(1)
        outputRangePos.push(0)
        outputRangeValue.push(0)
      }
      this.offsetCollection = scrollValue.interpolate({
        inputRange,
        outputRange: outputRangePos,
      })
      this.widthCollection = scrollValue.interpolate({
        inputRange,
        outputRange: outputRangeValue,
      })

      const containerValue = get(this.containerLayout, getKey)
      const scrollViewValue = get(this.scrollViewLayout, getKey)
      let maxScrollOffset = scrollViewValue - containerValue
      if (maxScrollOffset < 0) maxScrollOffset = 0

      inputRange.forEach((key, index) => {
        if (index === 0) return

        const tabPos = outputRangePos[index]
        const tabValue = outputRangeValue[index]

        // const nextTabLeft = outputRangePos[index + 1] || scrollViewValue
        // 计算tab间的间距
        // const tabMargin = nextTabLeft - (tabPos + tabValue)
        // 默认定位到中间
        let scrollOffset = (tabPos - (containerValue / 2)) + (tabValue / 2)
        if (scrollPosition === 'prev') {
          const prevTabLeft = outputRangePos[index - 1]
          // const prevTabWidth = outputRangeValue[index - 1]

          scrollOffset = prevTabLeft
        } else if (scrollPosition === 'next') {
          const nextTabLeft = outputRangePos[index + 1] || tabPos + tabValue
          const nextTabValue = outputRangeValue[index + 1] || 0
          const totalLength = nextTabLeft + nextTabValue

          scrollOffset = totalLength - containerValue
        }

        if (scrollOffset < 0) scrollOffset = 0
        if (scrollOffset > maxScrollOffset) scrollOffset = maxScrollOffset

        outputRangeScroll.push(scrollOffset)
      })

      if (scrollViewValue <= containerValue) {
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

      const tabTotalValue = outputRangeValue.reduce((count, value) => {
        return count + value
      }, 0)
      if (tabTotalValue > containerValue) {
        this.isScrollTabBar = true
      } else {
        this.isScrollTabBar = false
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

    _updateAnimated(toValue, callBack) {
      const { duration } = this.props
      const { scrollValue } = this.state
      const easing = Easing.out(Easing.ease)

      Animated.timing(scrollValue, { toValue, duration, easing }).start(callBack)
    }

    _onPress = (page, tab) => {
      const { goToPage, activeTab, hasAnimation } = this.props
      const { scrollValue } = this.state
      if (page === activeTab) return

      // this._direction = page > activeTab ? 'next' : 'prev'
      if (!this.hasPos && hasAnimation) {
        this._isOnPress = true
        this._updateAnimated(page, () => {
          this._isOnPress = false
        })
      } else {
        // 这里只是同步一下值，并没有元素消费这个动画值，只是在用这个值做映射
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

      const { style, scrollViewStyle, underlineStyle, tabStyle, tabActiveStyle, tabTextStyle, tabTextActiveStyle, vertical } = this.props

      const baseStyles = getMergeObject(defaultStyle, {
        containerStyle: style,
        scrollViewStyle,
        underlineStyle,
        tabStyle,
        tabActiveStyle,
        tabTextStyle,
        tabTextActiveStyle,
      })

      const commonStyles = getMergeObject(baseStyles, getCommonStyle({ vertical }))
      const mergeStyles = getMergeObject(commonStyles, Style)
      this.Style = getMergeObject(mergeStyles, super._getStyle())

      return this.Style
    }

    render() {
      const { tabs, vertical, scrollEnabled } = this.props
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
            vertical={vertical}
          >
            {tabs.map(this.renderTab)}
            {this.renderUnderline(underlineStyle)}
          </ScrollView>
        </View>
      )
    }
  }
}

const defaultStyle = {
  containerStyle: {
    borderTopWidth: 0,
    borderLeftWidth: 0,
    borderRightWidth: 0,
    borderBottomWidth: 0,
    borderColor: '#d2d2d2',
    borderStyle: 'solid',
  },
  tabTextActiveStyle: {
    color: 'navy',
  },
  underlineStyle: {
    backgroundColor: 'navy',
    height: 2,
    width: 2,
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

const getCommonStyle = ({ vertical }) => {
  const borderWIdthKey = vertical ? 'borderRightWidth' : 'borderBottomWidth'
  const linePos = vertical ? 'top' : 'left'
  const lineSize = vertical ? 'height' : 'width'
  const flexDirection = vertical ? 'column' : 'row'

  return {
    containerStyle: {
      overflow: 'hidden',
      flexDirection,
      justifyContent: 'flex-start',
      [borderWIdthKey]: 1,
    },
    underlineStyle: {
      position: 'absolute',
      [linePos]: 0,
      [lineSize]: 0,
    },
    scrollViewStyle: {
      flexDirection,
      position: 'relative',
    },
  }
}
