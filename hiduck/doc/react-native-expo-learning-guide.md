# React Native + Expo 跨端学习与 Android Mock App 指南

最后校准日期：2026-08-22

这份文档面向当前环境：

- 开发机器：Windows + WSL2 + Ubuntu 24.04
- 编辑器：VS Code，建议通过 Remote - WSL 打开项目
- 学习目标：用 React Native + Expo 开发 Android 手机、iPhone、iPad、Android 平板都能运行的跨端 App
- 第一阶段目标：先 mock 一个小 App，并在 Android 端跑起来

## 需求拆解

你的目标可以拆成 4 件事：

1. 掌握 React、React Native、Expo 的核心知识，理解跨端 App 的开发方式。
2. 在 WSL + Ubuntu 24.04 + VS Code 下搭好日常开发环境。
3. 用 Expo 创建一个最小 App，先在 Android 真机或模拟器上跑通。
4. 后续再补齐平板适配、iOS 测试、原生能力、打包发布等工程化能力。

建议路线：先使用 `Expo Go + Android 真机` 跑通开发闭环；等需要相机、推送、地图、原生 SDK 或正式构建时，再进入 `Development Build + EAS Build`。

## 需要掌握的知识点

### 1. JavaScript / TypeScript

- ES Module：`import` / `export`
- 常用语法：解构、箭头函数、数组方法、Promise、async / await
- TypeScript 基础：类型标注、接口、联合类型、泛型、组件 props 类型
- Node.js 与 npm：`package.json`、依赖安装、脚本命令

建议直接用 TypeScript 学 React Native。Expo 默认模板已经支持 TypeScript。

### 2. React

- JSX 语法
- 函数组件
- `useState`
- `useEffect`
- `useMemo`
- 组件拆分
- Props 与 State
- Context 或轻量状态管理
- 表单输入与受控组件

React Native 的 UI 编写方式来自 React，但渲染目标不是浏览器 DOM，而是原生控件。

### 3. React Native

必须熟悉这些基础组件和 API：

- 布局：`View`
- 文本：`Text`
- 图片：`Image`
- 输入：`TextInput`
- 列表：`FlatList`
- 滚动：`ScrollView`
- 交互：`Pressable`
- 样式：`StyleSheet`
- 平台判断：`Platform`
- 屏幕尺寸：`useWindowDimensions`
- 状态栏与安全区：`StatusBar`、`SafeAreaView`

重点理解：

- React Native 没有浏览器里的 `div`、`span`、CSS 文件。
- 样式接近 CSS，但不是完整 CSS。
- 布局核心是 Flexbox。
- 手机和平板适配通常通过宽度断点、横竖屏、字体缩放、安全区来处理。

### 4. Expo

需要理解这些概念：

- `create-expo-app`：创建 Expo 项目
- Expo CLI：`npx expo start`、`npx expo doctor`、`npx expo run:android`
- Expo Go：适合学习和快速预览，有原生能力限制
- Development Build：你自己的调试版 App，适合正式项目
- Expo SDK：相机、文件、定位、传感器、通知等能力
- `app.json` / `app.config.ts`：App 名称、图标、权限、平台配置
- EAS Build：云端构建 Android / iOS 安装包
- EAS Update：上线后的 JS / 资源热更新能力

### 5. 路由与页面组织

建议学习 Expo Router：

- 文件路由
- Stack 页面栈
- Tabs 底部导航
- 动态路由参数
- 页面跳转
- 深链

早期 mock App 可以先不用路由；一旦超过 2 个页面，就建议引入 Expo Router。

### 6. 数据与本地存储

按学习顺序掌握：

- `fetch` 调接口
- loading / error / empty 状态
- `AsyncStorage`：简单本地键值存储
- `expo-sqlite`：结构化本地数据
- `expo-secure-store`：保存 token 等敏感信息
- React Query / TanStack Query：服务端数据缓存

### 7. 跨手机和平板适配

手机和平板不是单纯缩放关系，建议按布局断点处理：

- 小屏手机：单列布局
- 大屏手机 / 折叠屏：更宽的间距和列表
- 平板竖屏：双列卡片或侧边信息
- 平板横屏：侧栏 + 内容区

常用方式：

```tsx
const { width } = useWindowDimensions();
const isTablet = width >= 768;
```

然后根据 `isTablet` 切换列数、间距、字号、导航形态。

### 8. iOS / iPad 注意事项

- WSL 不能运行 iOS Simulator。
- 本地 iOS 原生构建需要 macOS + Xcode。
- 学习阶段可以用 iPhone / iPad 安装 Expo Go 预览。
- 正式 iOS 打包可以用 EAS Build 云构建，但仍需要 Apple Developer 账号。
- iPad 需要额外关注横屏、分屏、多窗口、键盘输入和更大的点击区域。

## WSL + Ubuntu 24.04 环境方案

### 推荐开发路径

第一阶段推荐：

```text
VS Code on Windows
  -> Remote - WSL 打开 Ubuntu 项目目录
  -> WSL 内运行 Node.js / Expo CLI
  -> Android 真机安装 Expo Go
  -> npx expo start --tunnel
  -> Android 手机扫码运行
```

这条路径最适合 WSL 初学者，因为它不依赖 Android SDK、JDK、Gradle、本地模拟器和 USB 转发。

### Node.js

建议使用 Node.js LTS，并通过 `nvm` 管理版本：

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.3/install.sh | bash
source ~/.bashrc
nvm install --lts
nvm use --lts
node -v
npm -v
```

不要全局安装旧的 `expo-cli`。现在通常使用项目内 Expo CLI：

```bash
npx expo start
npx expo doctor
```

### Android 真机

学习阶段最简单：

1. Android 手机安装 Expo Go。
2. 手机和电脑尽量在同一个 Wi-Fi。
3. WSL 网络不通时，用 tunnel：

```bash
npx expo start --tunnel
```

Android 端打开 Expo Go，选择 Scan QR Code 扫终端二维码。

### Android 模拟器

模拟器有两种路线：

1. Windows 安装 Android Studio 和模拟器，再让 Expo 通过网络或 tunnel 连接。
2. WSL 内配置 Android SDK、JDK、Gradle，再使用 `npx expo run:android` 构建 development build。

对初学者，建议先不要把模拟器作为第一条路。WSL + Android 模拟器容易遇到网络、ADB、硬件加速和路径问题。先用 Android 真机跑通，效率更高。

### Development Build 所需环境

当你需要 `npx expo run:android`、原生模块或自定义 native 配置时，需要补齐：

- JDK 17
- Android SDK
- Android Platform Tools
- Android Build Tools
- Gradle 由项目自动管理，通常不用单独装

Ubuntu 安装 JDK：

```bash
sudo apt update
sudo apt install -y openjdk-17-jdk
java -version
```

如果 Android SDK 安装在 WSL 内，可在 `~/.bashrc` 配置：

```bash
export JAVA_HOME=/usr/lib/jvm/java-17-openjdk-amd64
export ANDROID_HOME=$HOME/Android/Sdk
export ANDROID_SDK_ROOT=$ANDROID_HOME
export PATH=$PATH:$ANDROID_HOME/emulator
export PATH=$PATH:$ANDROID_HOME/platform-tools
export PATH=$PATH:$ANDROID_HOME/cmdline-tools/latest/bin
```

配置后执行：

```bash
source ~/.bashrc
adb version
npx expo doctor
```

## VS Code 插件与配置

### 必装插件

建议安装这些扩展：

- Remote - WSL：`ms-vscode-remote.remote-wsl`
- Expo Tools：`expo.vscode-expo-tools`
- React Native Tools：`msjsdiag.vscode-react-native`
- ESLint：`dbaeumer.vscode-eslint`
- Prettier：`esbenp.prettier-vscode`

说明：

- `Expo Tools` 是 Expo 官方 VS Code 扩展，提供 Expo 配置 IntelliSense、调试和预览能力。
- `React Native Tools` 适合 React Native / Expo 调试、命令面板和环境检查。
- 使用 Remote - WSL 打开项目后，代码相关扩展要安装到 WSL 远程环境里。

### 可选插件

- Error Lens：`usernamehw.errorlens`
- GitLens：`eamodio.gitlens`
- npm Intellisense：`christian-kohler.npm-intellisense`
- Path Intellisense：`christian-kohler.path-intellisense`

### 推荐 workspace 配置

可以在项目里创建 `.vscode/settings.json`：

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "eslint.validate": [
    "javascript",
    "javascriptreact",
    "typescript",
    "typescriptreact"
  ],
  "typescript.tsdk": "node_modules/typescript/lib",
  "files.eol": "\n",
  "terminal.integrated.defaultProfile.linux": "bash"
}
```

可以在项目里创建 `.vscode/extensions.json`：

```json
{
  "recommendations": [
    "ms-vscode-remote.remote-wsl",
    "expo.vscode-expo-tools",
    "msjsdiag.vscode-react-native",
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "usernamehw.errorlens"
  ]
}
```

## Mock App：在 Android 端跑起来

### 1. 创建项目

当前 Expo 官方文档在 SDK 57 过渡期有一个重要说明：

- 如果你准备用 Expo Go 在真机上快速学习，选择 SDK 54 项目更稳。
- 如果你准备用 development build 或正式项目起步，可以使用 SDK 57 默认模板。

学习阶段建议先用 Expo Go，所以创建项目时按交互提示选择 Expo Go 支持的 SDK 版本。

```bash
npx create-expo-app@latest mock-notebook --template blank-typescript
cd mock-notebook
```

如果 CLI 询问 SDK 版本，选择 Expo Go 当前支持的 SDK。按 2026-08-22 的官方说明，Expo Go 学习路线选择 SDK 54；Development Build 路线可以选择 `default@sdk-57`。

### 2. 替换 `App.tsx`

把 `mock-notebook/App.tsx` 替换为：

```tsx
import { useMemo, useState } from 'react';
import {
  FlatList,
  Platform,
  Pressable,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from 'react-native';

type Note = {
  id: string;
  title: string;
  body: string;
  tag: string;
};

const initialNotes: Note[] = [
  {
    id: '1',
    title: '学习 React',
    body: '组件、props、state、hooks 是第一阶段重点。',
    tag: 'React',
  },
  {
    id: '2',
    title: '跑通 Android',
    body: '先用 Expo Go 扫码，降低 WSL 环境复杂度。',
    tag: 'Expo',
  },
  {
    id: '3',
    title: '适配平板',
    body: '大屏可以切换为双列卡片，避免简单拉伸手机 UI。',
    tag: 'Layout',
  },
];

export default function App() {
  const [notes, setNotes] = useState(initialNotes);
  const [keyword, setKeyword] = useState('');
  const { width } = useWindowDimensions();
  const columns = width >= 768 ? 2 : 1;

  const visibleNotes = useMemo(() => {
    const text = keyword.trim().toLowerCase();

    if (!text) {
      return notes;
    }

    return notes.filter((note) => {
      return [note.title, note.body, note.tag].some((value) =>
        value.toLowerCase().includes(text),
      );
    });
  }, [keyword, notes]);

  function addMockNote() {
    const nextIndex = notes.length + 1;

    setNotes([
      {
        id: String(Date.now()),
        title: `Mock 笔记 ${nextIndex}`,
        body: '这是本地状态生成的一条测试数据。',
        tag: Platform.OS,
      },
      ...notes,
    ]);
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />

      <View style={styles.container}>
        <View style={styles.header}>
          <View>
            <Text style={styles.eyebrow}>React Native + Expo</Text>
            <Text style={styles.title}>跨端笔记 Mock</Text>
          </View>

          <Pressable style={styles.button} onPress={addMockNote}>
            <Text style={styles.buttonText}>新增</Text>
          </Pressable>
        </View>

        <TextInput
          value={keyword}
          onChangeText={setKeyword}
          placeholder="搜索标题、内容或标签"
          placeholderTextColor="#7c8596"
          style={styles.search}
        />

        <FlatList
          key={columns}
          data={visibleNotes}
          numColumns={columns}
          keyExtractor={(item) => item.id}
          columnWrapperStyle={columns > 1 ? styles.columnWrapper : undefined}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Text style={styles.tag}>{item.tag}</Text>
              <Text style={styles.cardTitle}>{item.title}</Text>
              <Text style={styles.cardBody}>{item.body}</Text>
            </View>
          )}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyText}>没有匹配的笔记</Text>
            </View>
          }
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f4f7fb',
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? 20 : 8,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 18,
  },
  eyebrow: {
    color: '#516070',
    fontSize: 13,
    marginBottom: 4,
  },
  title: {
    color: '#111827',
    fontSize: 28,
    fontWeight: '700',
  },
  button: {
    alignItems: 'center',
    backgroundColor: '#2563eb',
    borderRadius: 8,
    minHeight: 42,
    justifyContent: 'center',
    paddingHorizontal: 18,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  search: {
    backgroundColor: '#ffffff',
    borderColor: '#d8dee8',
    borderRadius: 8,
    borderWidth: 1,
    color: '#111827',
    fontSize: 16,
    minHeight: 48,
    paddingHorizontal: 14,
  },
  listContent: {
    gap: 14,
    paddingTop: 16,
    paddingBottom: 32,
  },
  columnWrapper: {
    gap: 14,
  },
  card: {
    backgroundColor: '#ffffff',
    borderColor: '#d8dee8',
    borderRadius: 8,
    borderWidth: 1,
    flex: 1,
    padding: 16,
  },
  tag: {
    alignSelf: 'flex-start',
    backgroundColor: '#e8f0fe',
    borderRadius: 6,
    color: '#1d4ed8',
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 10,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  cardTitle: {
    color: '#111827',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
  },
  cardBody: {
    color: '#4b5563',
    fontSize: 15,
    lineHeight: 22,
  },
  empty: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    color: '#6b7280',
    fontSize: 16,
  },
});
```

这个 mock App 覆盖了几个关键知识点：

- 本地状态：`useState`
- 派生数据：`useMemo`
- 表单输入：`TextInput`
- 列表渲染：`FlatList`
- 点击事件：`Pressable`
- 跨端判断：`Platform`
- 手机 / 平板适配：`useWindowDimensions`

### 3. 启动开发服务

```bash
npx expo start --tunnel
```

然后在 Android 手机上：

1. 打开 Expo Go。
2. 点击 Scan QR Code。
3. 扫描 WSL 终端里的二维码。
4. 修改 `App.tsx`，观察 Fast Refresh 是否生效。

如果网络非常稳定，也可以尝试：

```bash
npx expo start
```

如果二维码打不开，优先回到：

```bash
npx expo start --tunnel
```

### 4. 环境检查

项目目录内执行：

```bash
npx expo doctor
```

常见问题：

- 手机和电脑不在同一网络：使用 `--tunnel`。
- 依赖版本不匹配：运行 `npx expo doctor` 查看建议。
- Metro 缓存异常：运行 `npx expo start -c`。
- Expo Go SDK 不匹配：重新创建 Expo Go 支持的 SDK 版本项目，或改用 Development Build。
- Android 模拟器不可见：检查 `adb devices`，并确认 WSL 与模拟器所在环境能互相访问。

## 后续学习路线

### 第 1 周：跑通开发闭环

- 创建 Expo 项目
- 修改组件和样式
- 在 Android 真机跑起来
- 掌握 `View`、`Text`、`TextInput`、`Pressable`、`FlatList`
- 理解 `useState` 和 `useEffect`

### 第 2 周：页面与组件化

- 学习 Expo Router
- 做 2 到 3 个页面
- 拆分组件
- 学习 props 和 TypeScript 类型
- 加入 loading、empty、error 状态

### 第 3 周：数据与本地能力

- 调用 HTTP API
- 使用 AsyncStorage 或 SQLite
- 学习图片、文件、相册、相机等 Expo SDK
- 处理权限申请

### 第 4 周：跨端与工程化

- 适配手机和平板
- 测试 Android / iOS 差异
- 配置 app icon、splash screen
- 学习 Development Build
- 学习 EAS Build

## 什么时候从 Expo Go 升级到 Development Build

出现下面任意情况，就应该考虑 Development Build：

- 需要使用 Expo Go 不包含的原生模块
- 需要接入第三方原生 SDK
- 需要自定义 Android / iOS 原生配置
- 需要推送通知、地图、支付、登录 SDK 等生产能力
- 需要更接近真实包的调试环境

本地 Android development build 命令：

```bash
npx expo run:android
```

云端 Android development build 路线：

```bash
npm install --global eas-cli
eas login
eas build:configure
eas build --platform android --profile development
```

## 推荐官方文档

- Expo 创建项目：https://docs.expo.dev/get-started/create-a-project/
- Expo 环境配置：https://docs.expo.dev/get-started/set-up-your-environment/
- Expo 开始开发：https://docs.expo.dev/get-started/start-developing/
- Expo create-expo-app：https://docs.expo.dev/more/create-expo/
- Expo VS Code 工具：https://docs.expo.dev/develop/tools/
- React Native 文档：https://reactnative.dev/docs/getting-started
- React Native `useWindowDimensions`：https://reactnative.dev/docs/usewindowdimensions

## 当前最小可执行结论

如果只想最快看到 Android 端效果，按这个顺序执行：

```bash
npx create-expo-app@latest mock-notebook --template blank-typescript
cd mock-notebook
```

如果 CLI 询问 SDK 版本，学习阶段选择 Expo Go 当前支持的 SDK。

然后替换 `App.tsx`，再运行：

```bash
npx expo start --tunnel
```

Android 手机用 Expo Go 扫码即可。
