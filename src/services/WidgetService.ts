import { NativeModules, Platform } from 'react-native';
import { DiaryEntry } from '../types';

interface WidgetData {
  todayEntries: {
    id: string;
    title: string;
    emoji: string;
    status?: 'realized' | 'not_realized';
  }[];
  futureEntries: {
    id: string;
    title: string;
    content: string;
    emoji: string;
    date: string;
  }[];
  futureCount: number;
  totalEntries: number;
  currentTheme: {
    id: string;
    name: string;
    colors: {
      primary: string;
      background: string;
      surface: string;
      text: string;
    };
  };
  lastUpdated: string;
}

interface WidgetModule {
  updateWidgetData(data: string): Promise<void>;
  refreshWidgets(): Promise<void>;
}

// 네이티브 모듈 인터페이스
const { FutureDiaryWidget } = NativeModules as {
  FutureDiaryWidget: WidgetModule;
};

export class WidgetService {
  static async updateWidgetData(entries: DiaryEntry[], currentTheme: any) {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // 오늘 일어날 일들 필터링
      const todayEntries = entries.filter(entry => {
        const entryDate = new Date(entry.date);
        entryDate.setHours(0, 0, 0, 0);
        const diffTime = entryDate.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays === 0;
      });

      // 미래 일기 개수 계산 및 정렬
      const futureEntries = entries
        .filter(entry => {
          const entryDate = new Date(entry.date);
          entryDate.setHours(0, 0, 0, 0);
          const diffTime = entryDate.getTime() - today.getTime();
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          return diffDays > 0;
        })
        .sort(
          (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
        ); // 날짜순 정렬

      const widgetData: WidgetData = {
        todayEntries: todayEntries.slice(0, 2).map(entry => ({
          id: entry.id,
          title: entry.title,
          emoji: entry.emoji || this.getMoodEmoji(entry.mood),
          status: entry.resultStatus,
        })),
        futureEntries: futureEntries.slice(0, 2).map(entry => ({
          id: entry.id,
          title: entry.title,
          content: entry.content,
          emoji: entry.emoji || this.getMoodEmoji(entry.mood),
          date: entry.date,
        })),
        futureCount: futureEntries.length,
        totalEntries: entries.length,
        currentTheme: {
          id: currentTheme.id,
          name: currentTheme.name,
          colors: {
            primary: currentTheme.colors.primary,
            background: currentTheme.colors.background,
            surface: currentTheme.colors.surface,
            text: currentTheme.colors.text,
          },
        },
        lastUpdated: new Date().toISOString(),
      };

      if (Platform.OS === 'ios' || Platform.OS === 'android') {
        await FutureDiaryWidget?.updateWidgetData(JSON.stringify(widgetData));
        await FutureDiaryWidget?.refreshWidgets();
      }

      console.log('✅ 위젯 데이터 업데이트 완료:', widgetData);
    } catch (error) {
      console.error('❌ 위젯 데이터 업데이트 실패:', error);
    }
  }

  static async refreshWidgets() {
    try {
      if (Platform.OS === 'ios' || Platform.OS === 'android') {
        await FutureDiaryWidget?.refreshWidgets();
      }
    } catch (error) {
      console.error('❌ 위젯 새로고침 실패:', error);
    }
  }

  private static getMoodEmoji(mood?: string): string {
    const moodMap = {
      excited: '🤩',
      happy: '😊',
      content: '😌',
      neutral: '😐',
      sad: '😢',
      angry: '😠',
      anxious: '😰',
    };
    return moodMap[mood as keyof typeof moodMap] || '😊';
  }
}
