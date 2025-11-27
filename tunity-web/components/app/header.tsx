import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Home } from "lucide-react";

/** The header component for the app */
export default function AppHeader() {
    return (
        <div className="flex p-4 justify-between">
            <h2 className="text-2xl font-bold">Tunity</h2>

            <div className="flex gap-2">
                <Button variant="outline" size="icon"><Home /></Button>
                <Input placeholder="What do you want to play?" />
            </div>

            <div className="flex gap-2">
                <Button variant="ghost">Sign up</Button>
                <Button variant="outline">Login</Button>
            </div>
        </div>
    )
}

