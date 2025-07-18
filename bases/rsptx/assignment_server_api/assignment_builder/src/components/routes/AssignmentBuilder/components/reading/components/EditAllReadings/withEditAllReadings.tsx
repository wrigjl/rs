import { useToastContext } from "@components/ui/ToastContext";
import { useUpdateAssignmentQuestionsMutation } from "@store/assignmentExercise/assignmentExercise.logic.api";
import { Button } from "primereact/button";
import { OverlayPanel } from "primereact/overlaypanel";
import { ComponentType, useRef, useState } from "react";

import { useReadingsSelector } from "@/hooks/useReadingsSelector";
import { DraggingExerciseColumns } from "@/types/components/editableTableCell";

export interface WithEditAllReadingsProps<T> {
  field: DraggingExerciseColumns;
  label: string;
  defaultValue: T;
}

export function withEditAllReadings<T, P extends WithEditAllReadingsProps<T>>(
  Component: ComponentType<P>
) {
  return function WrappedComponent(props: P) {
    const { showToast } = useToastContext();
    const [updateExercises] = useUpdateAssignmentQuestionsMutation();
    const { readingExercises = [] } = useReadingsSelector();
    const overlayRef = useRef<OverlayPanel>(null);
    const [value, setValue] = useState<T>(props.defaultValue);

    const toggleOverlay = (event: any) => {
      overlayRef.current?.toggle(event);
    };

    const handleSubmit = async () => {
      const exercises = readingExercises.map((ex) => ({
        ...ex,
        question_json: JSON.stringify(ex.question_json),
        [props.field]: value
      }));
      const { error } = await updateExercises(exercises);

      if (!error) {
        overlayRef.current?.hide();
        showToast({
          severity: "success",
          summary: "Success",
          detail: "Readings updated successfully"
        });
      } else {
        showToast({
          severity: "error",
          summary: "Error",
          detail: "Failed to update readings"
        });
      }
    };

    return (
      <div className="flex align-items-center gap-2">
        <span>{props.label}</span>
        <Button
          className="icon-button-sm"
          tooltip={`Edit "${props.label}" for all readings`}
          rounded
          text
          severity="secondary"
          size="small"
          icon="pi pi-pencil"
          onClick={toggleOverlay}
        />
        <OverlayPanel
          closeIcon
          ref={overlayRef}
          id="overlay_panel_input"
          style={{ width: "17rem" }}
        >
          <div className="p-1 flex gap-2 flex-column align-items-center justify-content-around">
            <div>
              <span>Edit "{props.label}" for all readings</span>
            </div>
            <div style={{ width: "100%" }}>
              <Component
                {...(props as P)}
                handleSubmit={handleSubmit}
                onChange={setValue}
                value={value}
              />
            </div>
            <div className="flex flex-row justify-content-around align-items-center w-full">
              <Button size="small" severity="danger" onClick={toggleOverlay}>
                Cancel
              </Button>
              <Button size="small" onClick={handleSubmit}>
                Submit
              </Button>
            </div>
          </div>
        </OverlayPanel>
      </div>
    );
  };
}
