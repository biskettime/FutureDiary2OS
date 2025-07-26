#!/bin/bash

echo "🌟 미래일기 위젯 설정 도우미"
echo "================================"

# 현재 디렉토리 확인
if [ ! -d "ios" ]; then
    echo "❌ iOS 디렉토리를 찾을 수 없습니다. 프로젝트 루트에서 실행해주세요."
    exit 1
fi

echo "✅ iOS 프로젝트 디렉토리 확인됨"

# Widget Extension 디렉토리 확인
if [ ! -d "ios/FutureDiaryWidget" ]; then
    echo "❌ Widget Extension 디렉토리가 없습니다."
    echo "📋 다음 단계를 수행해주세요:"
    echo "   1. Xcode에서 File → New → Target..."
    echo "   2. Widget Extension 선택"
    echo "   3. Product Name: FutureDiaryWidget"
    echo "   4. Bundle Identifier: com.futurediary.FutureDiaryWidget"
    exit 1
fi

echo "✅ Widget Extension 디렉토리 확인됨"

# Info.plist 확인
if [ ! -f "ios/FutureDiaryWidget/Info.plist" ]; then
    echo "❌ Widget Extension Info.plist 파일이 없습니다."
    echo "💡 파일이 자동으로 생성되었습니다."
else
    echo "✅ Widget Extension Info.plist 확인됨"
fi

# Swift 파일 확인
if [ ! -f "ios/FutureDiaryWidget/FutureDiaryWidgetExtension.swift" ]; then
    echo "❌ Widget Extension Swift 파일이 없습니다."
    exit 1
fi

echo "✅ Widget Extension Swift 파일 확인됨"

# React Native 브리지 파일 확인
if [ ! -f "ios/FutureDiary/FutureDiaryWidget.swift" ]; then
    echo "❌ React Native 브리지 파일이 없습니다."
    exit 1
fi

echo "✅ React Native 브리지 파일 확인됨"

# Pod 설치 확인
echo "🔄 Pod 의존성 확인 중..."
cd ios
if pod install; then
    echo "✅ Pod 설치 완료"
else
    echo "❌ Pod 설치 실패"
    exit 1
fi
cd ..

echo ""
echo "🎉 위젯 설정 완료!"
echo ""
echo "📋 다음 단계:"
echo "   1. Xcode에서 Widget Extension Target 추가 (아직 안했다면)"
echo "   2. App Groups 설정 (group.com.futurediary.shared)"
echo "   3. 앱 빌드 및 실행"
echo "   4. 시뮬레이터에서 위젯 추가해보기"
echo ""
echo "💡 문제가 있으면 WIDGET_SETUP.md 파일을 참고하세요!" 