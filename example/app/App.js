import React, { Component } from 'react'
import { ScrollView, TextInput, StyleSheet, Text, View, TouchableOpacity, Animated, Dimensions, Platform, NativeModules } from 'react-native'
import { ViewPaged } from 'react-scroll-paged-view'

import TabBar from 'react-underline-tabbar'
// import TabBar from '../src'

let height = Dimensions.get('window').height
const width = Dimensions.get('window').width

if (Platform.OS === 'android') {
  height -= NativeModules.StatusBarManager.HEIGHT
}

const styles = {
  containerWrap: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: '#F5FCFF',
    display: 'flex',
    height,
    width,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
  welcome: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10,
  },
  instructions: {
    textAlign: 'center',
    color: '#333333',
    marginBottom: 5,
    fontSize: 28,
  },
  tabStyle: {
    // flex: 1,
    // paddingHorizontal: 12,
  },
}

class Page extends Component {
  state = {
    value: 11111,
  }

  _onChangeText = (value) => {
    this.setState({ value })
  }

  render() {
    const { label, text = '' } = this.props
    const { value } = this.state

    return (
      <View style={styles.container}>
        {/* <TextInput
          style={{ height: 40, width: 200, borderColor: 'gray', borderWidth: 1 }}
          onChangeText={this._onChangeText}
          value={`${value}`}
        /> */}
        <Text style={styles.welcome}>
          {label}
        </Text>
        <Text style={styles.instructions}>
          {text}
        </Text>
      </View>
    )
  }
}

const Tab = ({ tab, page, isTabActive, onPressHandler, onTabLayout, styles }) => {
  const { label, icon } = tab
  const style = {
    marginHorizontal: 20,
    paddingVertical: 10,
  }
  const containerStyle = {
    paddingHorizontal: 20,
    paddingVertical: 5,
    borderRadius: 25,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: styles.backgroundColor,
    opacity: styles.opacity,
    transform: [{ scale: styles.opacity }],
  }
  const textStyle = {
    color: styles.textColor,
    fontWeight: '600',
  }
  const iconStyle = {
    tintColor: styles.textColor,
    resizeMode: 'contain',
    width: 22,
    height: 22,
    marginLeft: 10,
  }
  return (
    <TouchableOpacity style={style} onPress={onPressHandler} onLayout={onTabLayout} key={page}>
      <Animated.View style={containerStyle}>
        <Animated.Text style={textStyle}>{label}</Animated.Text>
        <Animated.Image style={iconStyle} source={icon} />
      </Animated.View>
    </TouchableOpacity>
  )
}

class UnderlineTabBarExample extends Component {
  _scrollX = new Animated.Value(0);
  // 6 is a quantity of tabs
  interpolators = Array.from({ length: 6 }, (_, i) => i).map(idx => ({
    scale: this._scrollX.interpolate({
      inputRange: [idx - 1, idx, idx + 1],
      outputRange: [1, 1.2, 1],
      extrapolate: 'clamp',
    }),
    opacity: this._scrollX.interpolate({
      inputRange: [idx - 1, idx, idx + 1],
      outputRange: [0.9, 1, 0.9],
      extrapolate: 'clamp',
    }),
    textColor: this._scrollX.interpolate({
      inputRange: [idx - 1, idx, idx + 1],
      outputRange: ['#000', '#fff', '#000'],
    }),
    backgroundColor: this._scrollX.interpolate({
      inputRange: [idx - 1, idx, idx + 1],
      outputRange: ['rgba(0,0,0,0.1)', '#000', 'rgba(0,0,0,0.1)'],
      extrapolate: 'clamp',
    }),
  }));

  tabs = [
    { label: 'Page' },
    { label: 'Page #22' },
    { label: 'Page #333' },
    { label: 'Page #4444' },
    { label: 'Page #55555' },
    { label: 'Page #666666' },
    { label: 'Page #777777' },
    // { label: 'Page #888888' },
    // { label: 'Page #999999' },
    // { label: 'Page #000000' },
    // { label: 'Page #111111' },
    // { label: 'Page #222222' },
    // { label: 'Page #333333' },
    // { label: 'Page #777777' },
    // { label: 'Page #888888' },
    // { label: 'Page #999999' },
    // { label: 'Page #777777' },
    // { label: 'Page #888888' },
    // { label: 'Page #999999' },
  ]

  state = {
    activeTab: 1,
  }

  _goToPage = (activeTab) => {
    this.setState({ activeTab })
  }

  render() {
    const { activeTab } = this.state

    return (
      <View style={[styles.containerWrap]}>
        {/* <TabBar
          tabs={this.tabs}
          // tabStyle={{ flex: 1 }}
          scrollViewStyle={{ justifyContent: 'space-around' }}
          vertical={false}
          goToPage={this._goToPage}
          activeTab={activeTab}
        /> */}
        <ViewPaged
          vertical={false}
          // initialPage={3}
          renderPosition='top'
          // renderPosition='left'
          renderHeader={(params) => {
            // console.log('TCL: render -> params', params)
            return (
              <TabBar
                tabs={this.tabs}
                tabStyle={{ paddingHorizontal: 8 }}
                {...params}
                vertical={false}
                // scrollViewStyle={{ flex: 1 }}
                // underlineStyle={{ width: 60 }}
                // isAutoSize
                // scrollPosition='next'
                // hasUnderline={false}
                // scrollEnabled={false}
                // hasAnimation={false}
                // vertical={false}
                // pos={null}
                // duration={2000}
              />
            )
          }}
        >
          {this.tabs.map(({ label, text }, index) => (
            <Page key={index} tabLabel={{ label }} label={text || label}/>
          ))}
        </ViewPaged>
        {/* <ViewPaged
          vertical={false}
          tabBarUnderlineColor='#53ac49'
          tabBarActiveTextColor='#53ac49'
          renderHeader={params => (
            <TabBar underlineColor='#53ac49' activeTabTextStyle={{ color: '#53ac49' }} {...params}/>
          )}
        >
          <Page tabLabel={{ label: 'Page #1' }} label='Page #1'/>
          <Page tabLabel={{ label: 'Page #2 aka Long!', badge: 3 }} label='Page #2 aka Long!'/>
          <Page tabLabel={{ label: 'Page #3', badge: 30, badgeColor: 'red' }} label='Page #3'/>
          <Page tabLabel={{ label: 'Page #4 aka Page', badge: 8, badgeColor: 'violet' }} label='Page #4 aka Page'/>
          <Page tabLabel={{ label: 'Page #5' }} label='Page #5'/>
          <Page tabLabel={{ label: 'Page #6 SUPER HYPER LONG PAGE' }} label='Page #6 SUPER HYPER LONG PAGE WITH NITRO ACCELERATORS'/>
        </ViewPaged>

        <ViewPaged
          vertical={false}
          renderHeader={params => (
            <TabBar
              underlineColor='#000'
              tabBarStyle={{ backgroundColor: '#fff', borderTopColor: '#d2d2d2', borderTopWidth: 1 }}
              renderTab={(tab, page, isTabActive, onPressHandler, onTabLayout) => (
                <Tab
                  key={page}
                  tab={tab}
                  page={page}
                  isTabActive={isTabActive}
                  onPressHandler={onPressHandler}
                  onTabLayout={onTabLayout}
                  styles={this.interpolators[page]}
                />
              )}
              {...params}
            />
          )}
          onScroll={x => this._scrollX.setValue(x)}
        >
          <Page tabLabel={{ label: 'Hot' }} label='Page #1 Hot' text='You can pass your own views to TabBar!'/>
          <Page tabLabel={{ label: 'Trending' }} label='Page #2 Trending' text='Yehoo!!!'/>
          <Page tabLabel={{ label: 'Fresh' }} label='Page #3 Fresh' text='Hooray!'/>
          <Page tabLabel={{ label: 'Funny' }} label='Page #4 Funny'/>
          <Page tabLabel={{ label: 'Movie & TV' }} label='Page #5 Movie & TV'/>
          <Page tabLabel={{ label: 'Sport' }} label='Page #6 Sport'/>
        </ViewPaged>

        <ViewPaged
          vertical={false}
          tabBarUnderlineColor='#53ac49'
          tabBarActiveTextColor='#53ac49'
          renderHeader={params => <TabBar {...params}/>}
        >
          <Page tabLabel={{ label: 'Page #1' }} label='Page #1'/>
          <Page tabLabel={{ label: 'Page #2', badge: 3 }} label='Page #2 aka Long!'/>
          <Page tabLabel={{ label: 'Page #3' }} label='Page #3'/>
        </ViewPaged> */}

      </View>
    )
  }
}

export default UnderlineTabBarExample
