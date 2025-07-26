import Foundation
import React
import WidgetKit

@objc(FutureDiaryWidgetModule)
class FutureDiaryWidgetModule: NSObject {
  
  static let appGroupIdentifier = "group.com.futurediary.shared"
  static let widgetDataKey = "WidgetData"
  
  @objc
  static func requiresMainQueueSetup() -> Bool {
    return false
  }
  
  @objc
  func updateWidgetData(_ data: String, 
                       resolver: @escaping RCTPromiseResolveBlock,
                       rejecter: @escaping RCTPromiseRejectBlock) {
    guard let userDefaults = UserDefaults(suiteName: FutureDiaryWidgetModule.appGroupIdentifier) else {
      rejecter("ERROR", "Failed to access shared UserDefaults", nil)
      return
    }
    
    userDefaults.set(data, forKey: FutureDiaryWidgetModule.widgetDataKey)
    userDefaults.synchronize()
    
    print("📱 위젯 데이터 저장 완료: \(data)")
    resolver(nil)
  }
  
  @objc
  func refreshWidgets(_ resolver: @escaping RCTPromiseResolveBlock,
                     rejecter: @escaping RCTPromiseRejectBlock) {
    if #available(iOS 14.0, *) {
      WidgetCenter.shared.reloadAllTimelines()
      print("🔄 위젯 새로고침 완료")
      resolver(nil)
    } else {
      rejecter("ERROR", "Widgets require iOS 14.0 or later", nil)
    }
  }
}

// React Native Bridge 설정
@objc(FutureDiaryWidgetBridge)
class FutureDiaryWidgetBridge: RCTEventEmitter {
  override static func requiresMainQueueSetup() -> Bool {
    return false
  }
  
  override func supportedEvents() -> [String]! {
    return []
  }
  
  @objc
  func updateWidgetData(_ data: String,
                       resolver: @escaping RCTPromiseResolveBlock,
                       rejecter: @escaping RCTPromiseRejectBlock) {
    let widget = FutureDiaryWidgetModule()
    widget.updateWidgetData(data, resolver: resolver, rejecter: rejecter)
  }
  
  @objc
  func refreshWidgets(_ resolver: @escaping RCTPromiseResolveBlock,
                     rejecter: @escaping RCTPromiseRejectBlock) {
    let widget = FutureDiaryWidgetModule()
    widget.refreshWidgets(resolver, rejecter: rejecter)
  }
} 