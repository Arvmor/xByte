export interface ParagraphProps {
    title?: string;
    text?: string;
}

export default function Paragraph({ title, text }: ParagraphProps) {
    return (
        <div className="flex flex-col gap-3">
            <h1 className="font-semibold">{title}</h1>
            <p className="text-muted-foreground">{text}</p>
        </div>
    );
}
