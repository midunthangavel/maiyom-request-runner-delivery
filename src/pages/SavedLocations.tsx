import PageShell from "@/components/PageShell";
import { ArrowLeft, MapPin, Plus, Home, Briefcase, Star } from "lucide-react";
import { useNavigate } from "react-router-dom";

const SavedLocations = () => {
    const navigate = useNavigate();

    const savedPlaces = [
        { id: 1, label: "Home", address: "123, Anna Salai, Chennai", icon: Home },
        { id: 2, label: "Work", address: "Tidel Park, Taramani, Chennai", icon: Briefcase },
        { id: 3, label: "Gym", address: "Gold's Gym, Adyar", icon: Star },
    ];

    return (
        <PageShell hideNav>
            <div className="px-5 pt-6">
                <div className="flex items-center gap-3 mb-6">
                    <button onClick={() => navigate(-1)} className="p-1">
                        <ArrowLeft size={20} className="text-foreground" />
                    </button>
                    <h1 className="font-display font-semibold text-foreground">Saved Locations</h1>
                </div>

                <div className="space-y-3">
                    {savedPlaces.map((place) => (
                        <div key={place.id} className="bg-card border border-border rounded-lg p-4 flex items-center gap-3 shadow-sm">
                            <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-primary">
                                <place.icon size={20} />
                            </div>
                            <div className="flex-1">
                                <p className="font-medium text-foreground">{place.label}</p>
                                <p className="text-xs text-muted-foreground">{place.address}</p>
                            </div>
                            <button className="text-xs text-primary font-medium">Edit</button>
                        </div>
                    ))}

                    <button className="w-full py-3 border border-dashed border-primary/50 rounded-lg flex items-center justify-center gap-2 text-primary font-medium bg-primary/5">
                        <Plus size={18} /> Add New Location
                    </button>
                </div>
            </div>
        </PageShell>
    );
};

export default SavedLocations;
