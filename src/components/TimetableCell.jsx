import { useDrag, useDrop } from "react-dnd";

const TYPE = "TIMETABLE_SLOT";

export default function TimetableCell({ slot, day, period, onDrop }) {

  const [{ isDragging }, drag] = useDrag(() => ({
    type: TYPE,
    item: slot,
    canDrag: !!slot,
    collect: (monitor) => ({
      isDragging: monitor.isDragging()
    })
  }));

  const [, drop] = useDrop(() => ({
    accept: TYPE,
    drop: (item) => {
      onDrop(item, day, period);
    }
  }));

  return (
    <div
      ref={(node) => drag(drop(node))}
      className="h-16 border flex items-center justify-center relative text-xs"
    >

      {slot ? (
        <div className={`p-2 rounded bg-primary/10 ${isDragging ? "opacity-40" : ""}`}>

          <div className="font-semibold">{slot.subject}</div>

          <div className="text-[10px]">{slot.teacher}</div>

        </div>
      ) : (
        <span className="text-muted-foreground">+</span>
      )}

    </div>
  );
}