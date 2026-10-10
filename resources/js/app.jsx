import "../css/app.css";
import "./bootstrap";

import { createInertiaApp } from "@inertiajs/react";
import { resolvePageComponent } from "laravel-vite-plugin/inertia-helpers";
import { createRoot } from "react-dom/client";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import GuestLayout from "@/Layouts/GuestLayout";

const appName = import.meta.env.VITE_APP_NAME || "Laravel";

createInertiaApp({
    title: (title) => `${title} - ${appName}`,
    resolve: async (name) => {
        const page = await resolvePageComponent(
            `./Pages/${name}.jsx`,
            import.meta.glob("./Pages/**/*.jsx"),
        );

        if (page.default.layout === undefined) {
            if (
                name === "Landing/Index" ||
                name === "Welcome" ||
                name === "Auth/Login"
            ) {
                page.default.layout = (page) => page;
            } else if (name.startsWith("Auth/")) {
                page.default.layout = (page) => (
                    <GuestLayout>{page}</GuestLayout>
                );
            } else {
                page.default.layout = (page) => (
                    <AuthenticatedLayout>{page}</AuthenticatedLayout>
                );
            }
        }

        return page;
    },
    setup({ el, App, props }) {
        const root = createRoot(el);

        root.render(<App {...props} />);
    },
    progress: {
        color: "#4B5563",
    },
});
