import { Badge } from "@/components/ui/badge"
import { CardTitle, CardDescription } from "@/components/ui/card"
import { Calendar, Users, ArrowRight } from "lucide-react"
import { MapPin } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Card, CardHeader, CardFooter, CardContent } from "@/components/ui/card"
import { createClient } from '@supabase/supabase-js';
// import { getTrials } from "@/app/api/trials"

export default async function TrialList() {
    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL || '',
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
    );
    // getTrials();

    const { data, error } = await supabase.from('trials').select('*');
    if (error) {
        console.error('Error fetching trials:', error);
    }
    const trials = data || [];

    return (
        <article className="space-y-4 mt-6">
            {trials.length > 0 ? (
                trials.map((trial) => (
                    <Card
                        key={trial.id}
                        className="overflow-hidden shadow-soft hover:shadow-hover transition-all duration-300"
                    >
                        <CardHeader className="pb-2">
                            <div className="flex justify-between">
                                <Badge
                                    variant="secondary"
                                    className={`${
                                            trial.status === 'RECRUITING'
                                                ? 'border-green-500'
                                                : trial.status === 'NOT_YET_RECRUITING'
                                                ? 'border-yellow-500'
                                                : trial.status === 'ENROLLING_BY_INVITATION'
                                                ? 'border-blue-500'
                                                : ''
                                        } bg-opacity-90`}
                                >
                                    {trial.status.replaceAll("_", " ")}
                                </Badge>
                                <Badge variant="outline" className="font-medium">
                                    {trial.phase}
                                </Badge>
                            </div>
                            <CardTitle className="text-xl mt-2">{trial.title}</CardTitle>
                            <CardDescription className="text-base text-primary-700">
                                {Array.isArray(trial.conditions) ? trial.conditions.join(', ') : trial.conditions}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="pb-2">
                            <div className="flex flex-col gap-4 text-sm">
                                <div className="flex items-center gap-1">
                                    <MapPin className="h-4 w-4 text-secondary-600" />
                                    <div className="flex gap-1">
                                        {Array.isArray(trial.locations) && trial.locations.length > 0 ? (
                                            trial.locations.slice(0, 3).map((location: string, index: number) => (
                                                <span key={index} className="border border-primary-200 rounded-md p-1">
                                                    {location}
                                                </span>
                                            ))
                                        ) : (
                                            <span>No locations specified</span>
                                        )}
                                    </div>
                                </div>
                                <div className="flex items-center gap-1">
                                    <Calendar className="h-4 w-4 text-secondary-600" />
                                    <span>Start: {trial.startDate}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <Users className="h-4 w-4 text-secondary-600" />
                                    <span>Participants: {trial.num_participants}</span>
                                </div>
                            </div>
                            <div className="mt-3 flex items-center gap-2"></div>
                            <div className="text-sm font-medium">Match Score:</div>
                        </CardContent>
                        <CardFooter className="pt-2">
                            <Link href={`/trials/${trial.nctId}`} className="w-full">
                                <Button variant="outline" className="w-full gap-1 hover:bg-primary-50 transition-colors">
                                    View Details
                                    <ArrowRight className="h-4 w-4" />
                                </Button>
                            </Link>
                        </CardFooter>
                    </Card>
                ))
            ) : (
                <div className="text-center p-6">
                    <p>No trials found</p>
                </div>
            )}
        </article>
    );
}