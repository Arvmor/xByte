import { Separator } from "@/components/ui/separator";

export interface LegalProps {
    title: string;
    lastUpdated: Date;
    sections: LegalSection[];
}

export interface LegalSection {
    title: string;
    content: string;
}

export default function AppLegal({ title, lastUpdated, sections }: LegalProps) {
    const lastUpdatedDate = lastUpdated.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
    });

    return (
        <div className="max-w-3xl mx-auto py-8">
            <div className="space-y-8">
                <div>
                    <h1 className="text-4xl font-bold mb-4">{title}</h1>
                    <p className="text-muted-foreground">Updated {lastUpdatedDate}</p>
                </div>

                <Separator />

                {sections.map((section, index) => (
                    <section key={index} className="space-y-4">
                        <h2 className="text-2xl font-semibold">{section.title}</h2>
                        <p className="text-muted-foreground">{section.content}</p>
                    </section>
                ))}
            </div>
        </div>
    );
}
