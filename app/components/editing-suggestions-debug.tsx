import React from "react";
import { Button } from "~/components/ui/button";
import type { Editor } from "@tiptap/react";

interface EditingSuggestionsDebugProps {
  editor: Editor | null;
}

export const EditingSuggestionsDebug: React.FC<
  EditingSuggestionsDebugProps
> = ({ editor }) => {
  const testSimpleSuggestion = () => {
    if (!editor) return;

    console.log("Testing simple suggestion...");

    // Get the current selection
    const { from, to } = editor.state.selection;

    if (from === to) {
      // No selection, select the word "and" if it exists
      const text = editor.getText();
      const andIndex = text.indexOf("and");

      if (andIndex !== -1) {
        editor.commands.setTextSelection({ from: andIndex, to: andIndex + 3 });
        console.log(`Selected "and" at position ${andIndex}-${andIndex + 3}`);
      } else {
        console.log("Could not find 'and' in text");
        return;
      }
    }

    // Apply the suggestion mark to the current selection
    const success = editor.commands.setEditingSuggestion({
      original: "and",
      suggested: "and,",
      explanation: "Add a comma before 'and'",
      id: "debug-test",
    });

    console.log("Suggestion applied:", success);
    console.log("Current HTML:", editor.getHTML());
  };

  const clearAllSuggestions = () => {
    if (!editor) return;

    console.log("Clearing all suggestions...");

    // Remove all editing suggestion marks
    const { state } = editor;
    const { doc } = state;

    doc.descendants((node, pos) => {
      if (node.isText) {
        const text = node.text || "";
        let startIndex = 0;

        while (true) {
          const foundIndex = text.indexOf("and", startIndex);
          if (foundIndex === -1) break;

          const from = pos + foundIndex;
          const to = from + 3;

          // Check if this range has our suggestion mark
          const marks = state.doc.rangeHasMark(
            from,
            to,
            editor.schema.marks.editingSuggestion
          );
          if (marks) {
            editor
              .chain()
              .setTextSelection({ from, to })
              .unsetMark("editingSuggestion")
              .run();
            console.log(`Removed suggestion from ${from}-${to}`);
          }

          startIndex = foundIndex + 1;
        }
      }
      return true;
    });
  };

  const logEditorState = () => {
    if (!editor) return;

    console.log("=== Editor State Debug ===");
    console.log("HTML:", editor.getHTML());
    console.log("Text:", editor.getText());
    console.log("Selection:", editor.state.selection);
    console.log("Available marks:", Object.keys(editor.schema.marks));
    console.log(
      "EditingSuggestion mark:",
      editor.schema.marks.editingSuggestion
    );
    console.log("========================");
  };

  return (
    <div className="p-4 border rounded-lg bg-gray-50 dark:bg-gray-800">
      <h3 className="text-sm font-medium mb-2">Debug Controls</h3>
      <div className="flex flex-wrap gap-2">
        <Button size="sm" onClick={testSimpleSuggestion}>
          Test Simple Suggestion
        </Button>
        <Button size="sm" variant="outline" onClick={clearAllSuggestions}>
          Clear All
        </Button>
        <Button size="sm" variant="outline" onClick={logEditorState}>
          Log State
        </Button>
      </div>
    </div>
  );
};
