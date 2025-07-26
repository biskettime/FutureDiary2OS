package com.futurediary

import android.appwidget.AppWidgetManager
import android.content.ComponentName
import android.content.Context
import android.content.Intent
import android.content.SharedPreferences
import com.facebook.react.bridge.*
import org.json.JSONObject

class WidgetModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {

    companion object {
        const val WIDGET_PREFS = "FutureDiaryWidgetPrefs"
        const val WIDGET_DATA_KEY = "WidgetData"
    }

    override fun getName(): String {
        return "FutureDiaryWidget"
    }

    @ReactMethod
    fun updateWidgetData(data: String, promise: Promise) {
        try {
            val context = reactApplicationContext
            val prefs: SharedPreferences = context.getSharedPreferences(WIDGET_PREFS, Context.MODE_PRIVATE)
            val editor = prefs.edit()
            
            editor.putString(WIDGET_DATA_KEY, data)
            editor.apply()
            
            println("📱 위젯 데이터 저장 완료: $data")
            promise.resolve(null)
        } catch (e: Exception) {
            promise.reject("ERROR", "Failed to save widget data", e)
        }
    }

    @ReactMethod
    fun refreshWidgets(promise: Promise) {
        try {
            val context = reactApplicationContext
            val intent = Intent(context, FutureDiaryAppWidget::class.java)
            intent.action = AppWidgetManager.ACTION_APPWIDGET_UPDATE
            
            val appWidgetManager = AppWidgetManager.getInstance(context)
            val componentName = ComponentName(context, FutureDiaryAppWidget::class.java)
            val widgetIds = appWidgetManager.getAppWidgetIds(componentName)
            
            intent.putExtra(AppWidgetManager.EXTRA_APPWIDGET_IDS, widgetIds)
            context.sendBroadcast(intent)
            
            println("🔄 위젯 새로고침 완료")
            promise.resolve(null)
        } catch (e: Exception) {
            promise.reject("ERROR", "Failed to refresh widgets", e)
        }
    }
} 