import WidgetKit
import SwiftUI

// 위젯 데이터 모델
struct WidgetData: Codable {
    let todayEntries: [TodayEntry]
    let futureEntries: [FutureEntry]
    let futureCount: Int
    let totalEntries: Int
    let currentTheme: ThemeInfo
    let lastUpdated: String
    
    struct TodayEntry: Codable, Identifiable {
        let id: String
        let title: String
        let emoji: String
        let status: String?
    }
    
    struct FutureEntry: Codable, Identifiable {
        let id: String
        let title: String
        let content: String
        let emoji: String
        let date: String
    }
    
    struct ThemeInfo: Codable {
        let id: String
        let name: String
        let colors: ColorInfo
        
        struct ColorInfo: Codable {
            let primary: String
            let background: String
            let surface: String
            let text: String
        }
    }
}

// 위젯 타임라인 엔트리
struct FutureDiaryWidgetEntry: TimelineEntry {
    let date: Date
    let widgetData: WidgetData?
}

// 위젯 데이터 프로바이더
struct FutureDiaryWidgetProvider: TimelineProvider {
    static let appGroupIdentifier = "group.com.futurediary.shared"
    static let widgetDataKey = "WidgetData"
    
    func placeholder(in context: Context) -> FutureDiaryWidgetEntry {
        FutureDiaryWidgetEntry(date: Date(), widgetData: nil)
    }
    
    func getSnapshot(in context: Context, completion: @escaping (FutureDiaryWidgetEntry) -> ()) {
        let entry = FutureDiaryWidgetEntry(date: Date(), widgetData: loadWidgetData())
        completion(entry)
    }
    
    func getTimeline(in context: Context, completion: @escaping (Timeline<Entry>) -> ()) {
        let currentDate = Date()
        let widgetData = loadWidgetData()
        
        let entry = FutureDiaryWidgetEntry(date: currentDate, widgetData: widgetData)
        
        // 15분마다 업데이트
        let nextUpdate = Calendar.current.date(byAdding: .minute, value: 15, to: currentDate)!
        let timeline = Timeline(entries: [entry], policy: .after(nextUpdate))
        
        completion(timeline)
    }
    
    private func loadWidgetData() -> WidgetData? {
        guard let userDefaults = UserDefaults(suiteName: FutureDiaryWidgetProvider.appGroupIdentifier),
              let dataString = userDefaults.string(forKey: FutureDiaryWidgetProvider.widgetDataKey),
              let data = dataString.data(using: .utf8) else {
            print("❌ 위젯 데이터를 불러올 수 없습니다")
            return nil
        }
        
        do {
            let widgetData = try JSONDecoder().decode(WidgetData.self, from: data)
            print("✅ 위젯 데이터 로드 성공: \(widgetData.todayEntries.count)개의 오늘 일정")
            return widgetData
        } catch {
            print("❌ 위젯 데이터 파싱 실패: \(error)")
            return nil
        }
    }
}

// 위젯 UI 뷰
struct FutureDiaryWidgetView: View {
    let entry: FutureDiaryWidgetProvider.Entry
    
    var body: some View {
        if let data = entry.widgetData {
            VStack(alignment: .leading, spacing: 6) {
                // 헤더
                HStack {
                    Text("🌟 미래일기")
                        .font(.subheadline)
                        .fontWeight(.bold)
                        .foregroundColor(Color(hex: data.currentTheme.colors.text))
                    
                    Spacer()
                    
                    Text("Total: \(data.totalEntries)")
                        .font(.caption2)
                        .foregroundColor(Color(hex: data.currentTheme.colors.text))
                        .opacity(0.6)
                }
                
                // 오늘 일어날 일 섹션
                Text("☀️ 오늘 일어날 일")
                    .font(.caption)
                    .fontWeight(.medium)
                    .foregroundColor(Color(hex: data.currentTheme.colors.text))
                
                if !data.todayEntries.isEmpty {
                    Text("\(data.todayEntries[0].emoji) \(data.todayEntries[0].title) \(data.todayEntries[0].status == "realized" ? "✅" : "⏳")")
                        .font(.caption2)
                        .lineLimit(1)
                        .foregroundColor(Color(hex: data.currentTheme.colors.text))
                        .opacity(0.8)
                } else {
                    Text("📝 오늘 계획된 일정이 없습니다")
                        .font(.caption2)
                        .foregroundColor(Color(hex: data.currentTheme.colors.text))
                        .opacity(0.6)
                }
                
                // 미래 일기 섹션
                Text("🔮 미래 일기")
                    .font(.caption)
                    .fontWeight(.medium)
                    .foregroundColor(Color(hex: data.currentTheme.colors.text))
                    .padding(.top, 4)
                
                if !data.futureEntries.isEmpty {
                    ForEach(data.futureEntries.prefix(2)) { futureEntry in
                        VStack(alignment: .leading, spacing: 2) {
                            HStack {
                                Text(formatDateForWidget(futureEntry.date))
                                    .font(.caption2)
                                    .fontWeight(.bold)
                                    .foregroundColor(Color(hex: data.currentTheme.colors.text))
                                    .opacity(0.7)
                                
                                Text("\(futureEntry.emoji) \(futureEntry.title)")
                                    .font(.caption2)
                                    .fontWeight(.medium)
                                    .foregroundColor(Color(hex: data.currentTheme.colors.primary))
                                    .lineLimit(1)
                                
                                Spacer()
                            }
                            
                            Text(futureEntry.content.count > 25 ? String(futureEntry.content.prefix(25)) + "..." : futureEntry.content)
                                .font(.caption2)
                                .foregroundColor(Color(hex: data.currentTheme.colors.text))
                                .opacity(0.6)
                                .lineLimit(1)
                                .padding(.leading, 12)
                        }
                    }
                } else {
                    Text("🔮 아직 미래 일기가 없습니다")
                        .font(.caption2)
                        .foregroundColor(Color(hex: data.currentTheme.colors.text))
                        .opacity(0.6)
                }
                
                Spacer()
                
                // 하단 정보
                HStack {
                    Text("Future: \(data.futureCount)")
                        .font(.caption2)
                        .foregroundColor(Color(hex: data.currentTheme.colors.primary))
                    
                    Spacer()
                    
                    Text(formatLastUpdated(data.lastUpdated))
                        .font(.caption2)
                        .foregroundColor(Color(hex: data.currentTheme.colors.text))
                        .opacity(0.6)
                }
            }
            .padding(12)
            .background(Color(hex: data.currentTheme.colors.background))
            .cornerRadius(12)
        } else {
            // 데이터가 없을 때 플레이스홀더
            VStack(spacing: 8) {
                Text("🌟 미래일기")
                    .font(.headline)
                    .fontWeight(.bold)
                
                Text("앱을 열어 일기를 작성해보세요!")
                    .font(.caption)
                    .multilineTextAlignment(.center)
                    .opacity(0.7)
            }
            .padding()
            .background(Color(.systemBackground))
            .cornerRadius(12)
        }
    }
    
    private func formatLastUpdated(_ dateString: String) -> String {
        let formatter = ISO8601DateFormatter()
        guard let date = formatter.date(from: dateString) else { return "" }
        
        let displayFormatter = DateFormatter()
        displayFormatter.timeStyle = .short
        displayFormatter.locale = Locale(identifier: "ko_KR")
        
        return displayFormatter.string(from: date)
    }
    
    private func formatDateForWidget(_ dateString: String) -> String {
        let inputFormatter = DateFormatter()
        inputFormatter.dateFormat = "yyyy-MM-dd"
        
        guard let date = inputFormatter.date(from: dateString) else {
            // fallback: "2025-07-31" -> "7/31"
            if dateString.count >= 10 {
                let monthStr = String(dateString.dropFirst(5).prefix(2))
                let dayStr = String(dateString.dropFirst(8).prefix(2))
                if let month = Int(monthStr), let day = Int(dayStr) {
                    return "\(month)/\(day)"
                }
            }
            return dateString
        }
        
        let outputFormatter = DateFormatter()
        outputFormatter.dateFormat = "M/d"
        return outputFormatter.string(from: date)
    }
}

// Color extension for hex strings
extension Color {
    init(hex: String) {
        let hex = hex.trimmingCharacters(in: CharacterSet.alphanumerics.inverted)
        var int: UInt64 = 0
        Scanner(string: hex).scanHexInt64(&int)
        let a, r, g, b: UInt64
        switch hex.count {
        case 3: // RGB (12-bit)
            (a, r, g, b) = (255, (int >> 8) * 17, (int >> 4 & 0xF) * 17, (int & 0xF) * 17)
        case 6: // RGB (24-bit)
            (a, r, g, b) = (255, int >> 16, int >> 8 & 0xFF, int & 0xFF)
        case 8: // ARGB (32-bit)
            (a, r, g, b) = (int >> 24, int >> 16 & 0xFF, int >> 8 & 0xFF, int & 0xFF)
        default:
            (a, r, g, b) = (1, 1, 1, 0)
        }
        
        self.init(
            .sRGB,
            red: Double(r) / 255,
            green: Double(g) / 255,
            blue:  Double(b) / 255,
            opacity: Double(a) / 255
        )
    }
}

// 위젯 메인 구조체
struct DiaryWidget: Widget {
    let kind: String = "DiaryWidget"
    
    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: FutureDiaryWidgetProvider()) { entry in
            FutureDiaryWidgetView(entry: entry)
        }
        .configurationDisplayName("미래일기")
        .description("오늘 일어날 일과 미래 일기를 확인하세요.")
        .supportedFamilies([.systemSmall, .systemMedium])
    }
} 