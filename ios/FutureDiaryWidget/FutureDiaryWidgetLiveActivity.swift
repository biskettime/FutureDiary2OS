//
//  FutureDiaryWidgetLiveActivity.swift
//  FutureDiaryWidget
//
//  Created by TAEYANG CHOI on 7/25/25.
//

import ActivityKit
import WidgetKit
import SwiftUI

struct FutureDiaryWidgetAttributes: ActivityAttributes {
    public struct ContentState: Codable, Hashable {
        // Dynamic stateful properties about your activity go here!
        var emoji: String
    }

    // Fixed non-changing properties about your activity go here!
    var name: String
}

struct FutureDiaryWidgetLiveActivity: Widget {
    var body: some WidgetConfiguration {
        ActivityConfiguration(for: FutureDiaryWidgetAttributes.self) { context in
            // Lock screen/banner UI goes here
            VStack {
                Text("Hello \(context.state.emoji)")
            }
            .activityBackgroundTint(Color.cyan)
            .activitySystemActionForegroundColor(Color.black)

        } dynamicIsland: { context in
            DynamicIsland {
                // Expanded UI goes here.  Compose the expanded UI through
                // various regions, like leading/trailing/center/bottom
                DynamicIslandExpandedRegion(.leading) {
                    Text("Leading")
                }
                DynamicIslandExpandedRegion(.trailing) {
                    Text("Trailing")
                }
                DynamicIslandExpandedRegion(.bottom) {
                    Text("Bottom \(context.state.emoji)")
                    // more content
                }
            } compactLeading: {
                Text("L")
            } compactTrailing: {
                Text("T \(context.state.emoji)")
            } minimal: {
                Text(context.state.emoji)
            }
            .widgetURL(URL(string: "http://www.apple.com"))
            .keylineTint(Color.red)
        }
    }
}

extension FutureDiaryWidgetAttributes {
    fileprivate static var preview: FutureDiaryWidgetAttributes {
        FutureDiaryWidgetAttributes(name: "World")
    }
}

extension FutureDiaryWidgetAttributes.ContentState {
    fileprivate static var smiley: FutureDiaryWidgetAttributes.ContentState {
        FutureDiaryWidgetAttributes.ContentState(emoji: "😀")
     }
     
     fileprivate static var starEyes: FutureDiaryWidgetAttributes.ContentState {
         FutureDiaryWidgetAttributes.ContentState(emoji: "🤩")
     }
}

#Preview("Notification", as: .content, using: FutureDiaryWidgetAttributes.preview) {
   FutureDiaryWidgetLiveActivity()
} contentStates: {
    FutureDiaryWidgetAttributes.ContentState.smiley
    FutureDiaryWidgetAttributes.ContentState.starEyes
}
