export interface PageProps {
    title: string;
    description: string;
}

export default function AppPageHeader({ title, description }: PageProps) {
    return (
        <div className="space-y-4">
            <h1 className="text-3xl font-bold">{title}</h1>
            <p className="text-muted-foreground">{description}</p>
        </div>
    );
}
