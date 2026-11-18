import { createContext, useContext, useEffect, useMemo, useState } from "react";
import {
  FlatList,
  Image,
  ImageSourcePropType,
  Pressable,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from "react-native";

const FB_BLUE = "#1877F2";

// ---------------------------------------------------------------
// YOUR PICTURES
// Put all of these files inside:  my-app/assets/images/
// (change the file names below if yours are different)
// ---------------------------------------------------------------

// Your own profile picture
const PROFILE_PIC = require("../../assets/images/my-photo.jpg");

// Pictures for the story boxes
const PEOPLE = {
  bensoy: require("../../assets/images/bensoy.jpg"),
  aldrin: require("../../assets/images/aldrin.jpg"),
  dalipat: require("../../assets/images/dalipat.jpg"),
  abonachita: require("../../assets/images/abonachita.jpg"),
  shet: require("../../assets/images/shet.jpg"),
};

// Pictures inside the 3 posts (the big boxes)
const POST_PICS = {
  post1: require("../../assets/images/post1.jpg"),
  post2: require("../../assets/images/post2.jpg"),
  post3: require("../../assets/images/post3.jpg"),
};

// ---------------------------------------------------------------
// THEME (light / dark)
// ---------------------------------------------------------------
type Colors = {
  bg: string;
  card: string;
  text: string;
  subText: string;
  border: string;
  circle: string;
};

const LIGHT: Colors = {
  bg: "#F0F2F5",
  card: "#FFFFFF",
  text: "#050505",
  subText: "#65676B",
  border: "#CED0D4",
  circle: "#E4E6EB",
};

const DARK: Colors = {
  bg: "#18191A",
  card: "#242526",
  text: "#E4E6EB",
  subText: "#B0B3B8",
  border: "#3E4042",
  circle: "#3A3B3C",
};

function makeStyles(c: Colors) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: c.bg },

    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 14,
      paddingVertical: 8,
      backgroundColor: c.card,
    },
    logo: {
      fontSize: 28,
      fontWeight: "800",
      color: FB_BLUE,
      letterSpacing: -1,
    },
    headerIcons: { flexDirection: "row", gap: 8 },
    iconCircle: {
      width: 38,
      height: 38,
      borderRadius: 19,
      backgroundColor: c.circle,
      alignItems: "center",
      justifyContent: "center",
    },
    iconText: { fontSize: 18, color: c.text },

    tabs: {
      flexDirection: "row",
      backgroundColor: c.card,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: c.border,
    },
    tab: {
      flex: 1,
      alignItems: "center",
      paddingVertical: 12,
      borderBottomWidth: 3,
      borderBottomColor: "transparent",
    },
    tabActive: { borderBottomColor: FB_BLUE },
    tabIcon: { fontSize: 22, color: c.text },

    card: { backgroundColor: c.card, marginBottom: 8 },

    createRow: {
      flexDirection: "row",
      alignItems: "center",
      padding: 12,
      gap: 10,
    },
    createInput: {
      flex: 1,
      borderWidth: 1,
      borderColor: c.border,
      borderRadius: 20,
      paddingVertical: 9,
      paddingHorizontal: 14,
    },
    createText: { color: c.subText, fontSize: 16 },

    story: {
      width: 100,
      height: 160,
      borderRadius: 12,
      justifyContent: "flex-end",
      padding: 8,
      overflow: "hidden",
      backgroundColor: c.circle,
    },
    storyAvatar: {
      position: "absolute",
      top: 8,
      left: 8,
      borderWidth: 3,
      borderColor: FB_BLUE,
      borderRadius: 22,
    },
    addStory: {
      position: "absolute",
      top: 60,
      alignSelf: "center",
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: FB_BLUE,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 3,
      borderColor: c.card,
    },
    storyName: {
      color: "#fff",
      fontWeight: "600",
      fontSize: 13,
      textShadowColor: "rgba(0,0,0,0.6)",
      textShadowRadius: 4,
    },
    createStoryName: { color: c.text, fontWeight: "600", fontSize: 13 },

    postHeader: { flexDirection: "row", alignItems: "center", padding: 12 },
    postName: { fontSize: 15, fontWeight: "700", color: c.text },
    postTime: { fontSize: 12, color: c.subText, marginTop: 2 },
    postText: {
      fontSize: 16,
      color: c.text,
      paddingHorizontal: 12,
      paddingBottom: 10,
    },
    postImage: { height: 300, width: "100%" },

    stats: {
      flexDirection: "row",
      justifyContent: "space-between",
      paddingHorizontal: 12,
      paddingVertical: 10,
    },
    statText: { color: c.subText, fontSize: 14 },

    actions: {
      flexDirection: "row",
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: c.border,
      paddingVertical: 4,
    },
    action: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 8,
      gap: 6,
    },
    actionText: { color: c.subText, fontWeight: "600", fontSize: 14 },
  });
}

type ThemeValue = {
  dark: boolean;
  toggle: () => void;
  c: Colors;
  s: ReturnType<typeof makeStyles>;
};

const ThemeCtx = createContext<ThemeValue>({
  dark: false,
  toggle: () => {},
  c: LIGHT,
  s: makeStyles(LIGHT),
});

// ---------------------------------------------------------------
// DATA
// ---------------------------------------------------------------
type Story = { id: string; name: string; pic: ImageSourcePropType };
type Post = {
  id: string;
  name: string;
  color: string; // color of the letter circle next to the name
  image: ImageSourcePropType;
  time: string;
  text: string;
  likes: number;
  comments: number;
  shares: number;
};

const STORIES: Story[] = [
  { id: "1", name: "Bensoy", pic: PEOPLE.bensoy },
  { id: "2", name: "Aldrin", pic: PEOPLE.aldrin },
  { id: "3", name: "Dalipat", pic: PEOPLE.dalipat },
  { id: "4", name: "Abonachita", pic: PEOPLE.abonachita },
  { id: "5", name: "Shet", pic: PEOPLE.shet },
];

const POSTS: Post[] = [
  {
    id: "1",
    name: "Bensoy",
    color: "#F59E0B",
    image: POST_PICS.post1,
    time: "2h · 🌎",
    text: "BREVANT ☀️",
    likes: 128,
    comments: 24,
    shares: 5,
  },
  {
    id: "2",
    name: "Aldrin",
    color: "#10B981",
    image: POST_PICS.post2,
    time: "5h · 🌎",
    text: "pic ngii 🚀",
    likes: 342,
    comments: 61,
    shares: 12,
  },
  {
    id: "3",
    name: "Dalipat",
    color: "#8B5CF6",
    image: POST_PICS.post3,
    time: "Yesterday · 🌎",
    text: " 🕺",
    likes: 87,
    comments: 9,
    shares: 1,
  },
];

// ---------------------------------------------------------------
// COMPONENTS
// ---------------------------------------------------------------

// Round picture (profile + story circles)
function PicAvatar({
  source,
  size = 40,
}: {
  source: ImageSourcePropType;
  size?: number;
}) {
  return (
    <Image
      source={source}
      style={{ width: size, height: size, borderRadius: size / 2 }}
      resizeMode="cover"
    />
  );
}

// Round letter circle (no picture) used next to post names
function LetterAvatar({
  name,
  color,
  size = 40,
}: {
  name: string;
  color: string;
  size?: number;
}) {
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: color,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Text style={{ color: "#fff", fontWeight: "700", fontSize: size * 0.4 }}>
        {name.charAt(0)}
      </Text>
    </View>
  );
}

function Header() {
  const { s, dark, toggle } = useContext(ThemeCtx);
  return (
    <View style={s.header}>
      <Text style={s.logo}>facebook</Text>
      <View style={s.headerIcons}>
        <Pressable style={s.iconCircle} onPress={toggle}>
          <Text style={s.iconText}>{dark ? "☀️" : "🌙"}</Text>
        </Pressable>
        <View style={s.iconCircle}>
          <Text style={s.iconText}>🔍</Text>
        </View>
        <View style={s.iconCircle}>
          <Text style={s.iconText}>💬</Text>
        </View>
      </View>
    </View>
  );
}

function TabsBar() {
  const { s } = useContext(ThemeCtx);
  const [active, setActive] = useState(0);
  const tabs = ["🏠", "👥", "📺", "🏪", "🔔", "☰"];
  return (
    <View style={s.tabs}>
      {tabs.map((icon, i) => (
        <Pressable
          key={i}
          style={[s.tab, active === i && s.tabActive]}
          onPress={() => setActive(i)}
        >
          <Text style={[s.tabIcon, active !== i && { opacity: 0.5 }]}>
            {icon}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}

function CreatePost() {
  const { s } = useContext(ThemeCtx);
  return (
    <View style={s.card}>
      <View style={s.createRow}>
        <PicAvatar source={PROFILE_PIC} />
        <Pressable style={s.createInput}>
          <Text style={s.createText}>What's on your mind?</Text>
        </Pressable>
        <Text style={{ fontSize: 24 }}>🖼️</Text>
      </View>
    </View>
  );
}

// All story boxes have the SAME size.
const STORY_WIDTH = 110;
const STORY_HEIGHT = 180;
// How the picture fills the box:
//   'cover'   = fills the whole box (edges of the photo may be cut)
//   'stretch' = fills the whole box and shows the whole photo (can look squeezed)
//   'contain' = shows the whole photo without squeezing (empty space on the sides)
const STORY_FIT: "cover" | "stretch" | "contain" = "stretch";

function StoryCard({ story }: { story: Story }) {
  const { s } = useContext(ThemeCtx);

  return (
    <View style={[s.story, { width: STORY_WIDTH, height: STORY_HEIGHT }]}>
      <Image
        source={story.pic}
        style={StyleSheet.absoluteFill}
        resizeMode={STORY_FIT}
      />
      <View style={s.storyAvatar}>
        <PicAvatar source={story.pic} size={34} />
      </View>
      <Text style={s.storyName}>{story.name}</Text>
    </View>
  );
}

function Stories() {
  const { s } = useContext(ThemeCtx);
  return (
    <View style={s.card}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ padding: 12, gap: 10 }}
      >
        {/* Create story box */}
        <View style={[s.story, { width: STORY_WIDTH, height: STORY_HEIGHT }]}>
          <View style={s.addStory}>
            <Text style={{ color: "#fff", fontSize: 20, fontWeight: "700" }}>
              +
            </Text>
          </View>
          <Text style={s.createStoryName}>Create story</Text>
        </View>

        {/* Story boxes with pictures */}
        {STORIES.map((st) => (
          <StoryCard key={st.id} story={st} />
        ))}
      </ScrollView>
    </View>
  );
}

function PostCard({ post }: { post: Post }) {
  const { s } = useContext(ThemeCtx);
  const [liked, setLiked] = useState(false);
  const likeCount = post.likes + (liked ? 1 : 0);

  return (
    <View style={s.card}>
      <View style={s.postHeader}>
        <LetterAvatar name={post.name} color={post.color} />
        <View style={{ flex: 1, marginLeft: 10 }}>
          <Text style={s.postName}>{post.name}</Text>
          <Text style={s.postTime}>{post.time}</Text>
        </View>
        <Text style={{ fontSize: 20, color: "#65676B" }}>•••</Text>
      </View>

      <Text style={s.postText}>{post.text}</Text>
      <Image source={post.image} style={s.postImage} resizeMode="cover" />

      <View style={s.stats}>
        <Text style={s.statText}>👍 {likeCount}</Text>
        <Text style={s.statText}>
          {post.comments} comments · {post.shares} shares
        </Text>
      </View>

      <View style={s.actions}>
        <Pressable style={s.action} onPress={() => setLiked(!liked)}>
          <Text style={{ fontSize: 18 }}>👍</Text>
          <Text style={[s.actionText, liked && { color: FB_BLUE }]}>Like</Text>
        </Pressable>
        <Pressable style={s.action}>
          <Text style={{ fontSize: 18 }}>💬</Text>
          <Text style={s.actionText}>Comment</Text>
        </Pressable>
        <Pressable style={s.action}>
          <Text style={{ fontSize: 18 }}>↪️</Text>
          <Text style={s.actionText}>Share</Text>
        </Pressable>
      </View>
    </View>
  );
}

function Screen() {
  const { s, dark } = useContext(ThemeCtx);
  return (
    <SafeAreaView style={s.container}>
      <StatusBar barStyle={dark ? "light-content" : "dark-content"} />
      <Header />
      <TabsBar />
      <FlatList
        data={POSTS}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <PostCard post={item} />}
        ListHeaderComponent={
          <>
            <CreatePost />
            <Stories />
          </>
        }
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

export default function HomeScreen() {
  // Starts with your phone/computer theme, tap 🌙/☀️ to switch
  const system = useColorScheme();
  const [override, setOverride] = useState<boolean | null>(null);
  const [mounted, setMounted] = useState(false);

  // wait until mounted so web server/client render match (fixes hydration error)
  useEffect(() => setMounted(true), []);

  const dark = override ?? (mounted && system === "dark");

  const value = useMemo<ThemeValue>(() => {
    const c = dark ? DARK : LIGHT;
    return { dark, toggle: () => setOverride(!dark), c, s: makeStyles(c) };
  }, [dark]);

  // First render is a plain blank screen (identical on server and browser),
  // then the real page appears right after. This stops the hydration error.
  if (!mounted) {
    return <View style={{ flex: 1, backgroundColor: LIGHT.bg }} />;
  }

  return (
    <ThemeCtx.Provider value={value}>
      <Screen />
    </ThemeCtx.Provider>
  );
}
