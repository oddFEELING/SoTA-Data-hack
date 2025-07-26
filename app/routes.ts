import {
  type RouteConfig,
  index,
  layout,
  prefix,
  route,
} from "@react-router/dev/routes";

export default [
  layout("routes/_layout.tsx", [
    // ~ =============================================>
    // ~ ======= Landing pages
    // ~ =============================================>
    layout("routes/landing/_layout.tsx", [index("routes/landing/home.tsx")]),

    // ~ =============================================>
    // ~ ======= Dashboard pages
    // ~ =============================================>
    ...prefix("dashboard", [
      layout("routes/dashboard/_layout.tsx", [
        route("overview", "routes/dashboard/overview.tsx"),
        route("chat/:id", "routes/dashboard/chat.[id].tsx"),
        route("files", "routes/dashboard/files.tsx"),
        route("stories", "routes/dashboard/stories/index.tsx"),
        route("stories/:id", "routes/dashboard/stories/story.[id].tsx"),
      ]),
    ]),
  ]),
] satisfies RouteConfig;
