import { EditorProvider as TiptapEditorProvider } from "@tiptap/react";
import { useTiptapSync } from "@convex-dev/prosemirror-sync/tiptap";
import StarterKit from "@tiptap/starter-kit";

type EditorProviderProps = {
  children: React.ReactNode;
  sync: ReturnType<typeof useTiptapSync>;
};

export const EditorProvider = ({ children, sync }: EditorProviderProps) => {
  if (sync.isLoading) {
    return <div>Loading...</div>;
  }
  return (
    <>
      {sync.initialContent && (
        <TiptapEditorProvider
          editorProps={{
            attributes: {
              class: "focus:outline-none",
            },
          }}
          content={sync.initialContent}
          extensions={[StarterKit, sync.extension]}
        >
          {children}
        </TiptapEditorProvider>
      )}
    </>
  );
};
