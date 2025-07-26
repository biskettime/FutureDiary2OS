package com.futurediary

import android.app.PendingIntent
import android.appwidget.AppWidgetManager
import android.appwidget.AppWidgetProvider
import android.content.Context
import android.content.Intent
import android.graphics.Color
import android.widget.RemoteViews
import org.json.JSONObject
import java.text.SimpleDateFormat
import java.util.*

class FutureDiaryAppWidget : AppWidgetProvider() {

    override fun onUpdate(
        context: Context,
        appWidgetManager: AppWidgetManager,
        appWidgetIds: IntArray
    ) {
        for (appWidgetId in appWidgetIds) {
            updateAppWidget(context, appWidgetManager, appWidgetId)
        }
    }

    private fun updateAppWidget(
        context: Context,
        appWidgetManager: AppWidgetManager,
        appWidgetId: Int
    ) {
        println("🔄 위젯 ${appWidgetId} 업데이트 시작")
        
        try {
            val views = RemoteViews(context.packageName, R.layout.widget_future_diary)
            
            // 필수 기본값 설정
            views.setTextViewText(R.id.widget_title, "🌟 미래일기")
            views.setTextViewText(R.id.widget_future_count, "Future: 0")
            views.setTextViewText(R.id.widget_today_item, "📝 오늘 계획된 일정이 없습니다")
            views.setTextViewText(R.id.widget_total_count, "Total: 0")
            views.setTextViewText(R.id.widget_last_updated, "")
            
            // 미래 일기 아이템들 숨기기
            views.setViewVisibility(R.id.widget_future_item1_container, 8) // View.GONE
            views.setViewVisibility(R.id.widget_future_item2_container, 8) // View.GONE
            
            println("✅ 기본값 설정 완료")
            
            // 실제 위젯 데이터 로드 시도
            try {
                val widgetData = loadWidgetData(context)
                
                if (widgetData != null) {
                    // 미래 일기 개수
                    val futureCount = widgetData.optInt("futureCount", 0)
                    views.setTextViewText(R.id.widget_future_count, "Future: ${futureCount}")
                    
                    // 총 개수
                    val totalEntries = widgetData.optInt("totalEntries", 0)
                    views.setTextViewText(R.id.widget_total_count, "Total: ${totalEntries}")
                    
                    // 오늘 일어날 일 처리
                    val todayEntries = widgetData.optJSONArray("todayEntries")
                    if (todayEntries != null && todayEntries.length() > 0) {
                        val firstEntry = todayEntries.getJSONObject(0)
                        val title = firstEntry.optString("title", "")
                        val emoji = firstEntry.optString("emoji", "😊")
                        val status = firstEntry.optString("status", "")
                        val statusIcon = if (status == "realized") "✅" else "⏳"
                        
                        views.setTextViewText(R.id.widget_today_item, "${emoji} ${title} ${statusIcon}")
                        println("✅ 오늘 일정 표시: ${title}")
                    }
                    
                    // 미래 일기 처리 (가장 가까운 미래 일기들 표시)
                    val futureEntries = widgetData.optJSONArray("futureEntries")
                    if (futureEntries != null && futureEntries.length() > 0) {
                        // 첫 번째 미래 일기
                        if (futureEntries.length() > 0) {
                            val firstFuture = futureEntries.getJSONObject(0)
                            val title = firstFuture.optString("title", "")
                            val content = firstFuture.optString("content", "")
                            val emoji = firstFuture.optString("emoji", "🔮")
                            val date = firstFuture.optString("date", "")
                            
                            val formattedDate = formatDateForWidget(date)
                            val truncatedContent = if (content.length > 30) content.substring(0, 30) + "..." else content
                            
                            views.setTextViewText(R.id.widget_future_item1_date, formattedDate)
                            views.setTextViewText(R.id.widget_future_item1_title, "${emoji} ${title}")
                            views.setTextViewText(R.id.widget_future_item1_content, truncatedContent)
                            views.setViewVisibility(R.id.widget_future_item1_container, 0) // View.VISIBLE
                            println("✅ 미래 일기 1 표시: ${formattedDate} - ${title}")
                        }
                        
                        // 두 번째 미래 일기
                        if (futureEntries.length() > 1) {
                            val secondFuture = futureEntries.getJSONObject(1)
                            val title = secondFuture.optString("title", "")
                            val content = secondFuture.optString("content", "")
                            val emoji = secondFuture.optString("emoji", "🔮")
                            val date = secondFuture.optString("date", "")
                            
                            val formattedDate = formatDateForWidget(date)
                            val truncatedContent = if (content.length > 30) content.substring(0, 30) + "..." else content
                            
                            views.setTextViewText(R.id.widget_future_item2_date, formattedDate)
                            views.setTextViewText(R.id.widget_future_item2_title, "${emoji} ${title}")
                            views.setTextViewText(R.id.widget_future_item2_content, truncatedContent)
                            views.setViewVisibility(R.id.widget_future_item2_container, 0) // View.VISIBLE
                            println("✅ 미래 일기 2 표시: ${formattedDate} - ${title}")
                        }
                    }
                    
                    // 업데이트 시간
                    val lastUpdated = widgetData.optString("lastUpdated", "")
                    if (lastUpdated.isNotEmpty()) {
                        val formattedTime = formatLastUpdated(lastUpdated)
                        views.setTextViewText(R.id.widget_last_updated, formattedTime)
                    }
                    
                    println("✅ 위젯 데이터 적용 완료: Future=${futureCount}, Total=${totalEntries}, Today=${todayEntries?.length() ?: 0}")
                } else {
                    println("⚠️ 위젯 데이터 없음 - 기본값 유지")
                }
            } catch (e: Exception) {
                println("❌ 위젯 데이터 로드 실패: ${e.message}")
                e.printStackTrace()
                // 기본값 유지
            }
            
            // 위젯 업데이트 실행
            appWidgetManager.updateAppWidget(appWidgetId, views)
            println("✅ 위젯 ${appWidgetId} 업데이트 완료")
            
        } catch (e: Exception) {
            println("❌ 위젯 ${appWidgetId} 업데이트 실패: ${e.message}")
            e.printStackTrace()
            
            // 최소한의 fallback
            try {
                val fallbackViews = RemoteViews(context.packageName, R.layout.widget_future_diary)
                fallbackViews.setTextViewText(R.id.widget_title, "미래일기")
                appWidgetManager.updateAppWidget(appWidgetId, fallbackViews)
                println("✅ Fallback 위젯 설정 완료")
            } catch (fallbackError: Exception) {
                println("❌ Fallback도 실패: ${fallbackError.message}")
            }
        }
    }
    
    private fun loadWidgetData(context: Context): JSONObject? {
        return try {
            val prefs = context.getSharedPreferences(WidgetModule.WIDGET_PREFS, Context.MODE_PRIVATE)
            val dataString = prefs.getString(WidgetModule.WIDGET_DATA_KEY, null)
            
            if (dataString != null) {
                JSONObject(dataString)
            } else {
                null
            }
        } catch (e: Exception) {
            println("❌ 위젯 데이터 로드 실패: ${e.message}")
            null
        }
    }
    
    private fun formatLastUpdated(dateString: String): String {
        return try {
            val inputFormat = SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'", Locale.getDefault())
            val outputFormat = SimpleDateFormat("HH:mm", Locale.KOREA)
            val date = inputFormat.parse(dateString)
            outputFormat.format(date ?: Date())
        } catch (e: Exception) {
            ""
        }
    }

    private fun formatDateForWidget(dateString: String): String {
        return try {
            val formatter = SimpleDateFormat("yyyy-MM-dd", Locale.US)
            val date = formatter.parse(dateString)
            val displayFormatter = SimpleDateFormat("M/d", Locale.US)
            displayFormatter.format(date ?: Date())
        } catch (e: Exception) {
            println("❌ 날짜 포맷팅 실패: ${e.message}")
            // fallback: "2025-07-31" -> "7/31"
            if (dateString.length >= 10) {
                val month = dateString.substring(5, 7).toIntOrNull()?.toString() ?: "1"
                val day = dateString.substring(8, 10).toIntOrNull()?.toString() ?: "1"
                "${month}/${day}"
            } else {
                dateString
            }
        }
    }
} 