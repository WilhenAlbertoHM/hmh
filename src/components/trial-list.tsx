import { Badge } from "@/components/ui/badge";
import { CardTitle, CardDescription } from "@/components/ui/card";
import { Calendar, Users, ArrowRight, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Card, CardHeader, CardFooter, CardContent } from "@/components/ui/card";
import { createClient } from '@supabase/supabase-js';
import { type Trial } from '../app/types/trial';

export default async function TrialList() {
    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL || '',
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
    );

    // Fetch patient recommendations
    const { data, error } = await supabase
    .from('trials')
    .select('*');

    const trials = data || [];
    return (
        <article className="space-y-4 mt-6">
            {trials.length > 0 ? (
                trials.map((trial: Trial, index: number) => (
                    <Card
                        key={trial.nctId || index}
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
                                    <div className="flex gap-1 flex-wrap">
                                        {Array.isArray(trial.locations) && trial.locations.length > 0 ? (
                                            trial.locations.slice(0, 3).map((location, index) => (
                                                <span key={index} className="border border-primary-200 rounded-md p-1">
                                                    {location}
                                                </span>
                                            ))
                                        ) : (
                                            <span>No location available</span>
                                        )}
                                    </div>
                                </div>
                                <div className="flex items-center gap-1">
                                    <Calendar className="h-4 w-4 text-secondary-600" />
                                    <span>Start Date: {trial.startDate || 'Unknown'}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <Users className="h-4 w-4 text-secondary-600" />
                                    <span>Participants: {trial.participants || 'Not Specified'}</span>
                                </div>
                            </div>
                        </CardContent>
                        <CardFooter className="flex justify-end">
                            <Link href={`/trials/${trial.nctId}`} passHref>
                                <Button variant="outline">
                                    Learn More <ArrowRight className="ml-2 h-4 w-4" />
                                </Button>
                            </Link>
                        </CardFooter>
                    </Card>
                ))
            ) : (
                <p className="text-center text-gray-500">No recommended trials found.</p>
            )}
        </article>
    );
}
