import { NextResponse } from 'next/server';
import { createClient } from "@supabase/supabase-js";
import { type Trial } from "../types/trial";
import { type Client } from "../types/client";
import Groq from "groq-sdk";

const API_BASE_URL = "https://clinicaltrials.gov/api/v2/studies?postFilter.overallStatus=RECRUITING,AVAILABLE,ENROLLING_BY_INVITATION,NOT_YET_RECRUITING&countTotal=true&pageSize=20&sort=@relevance";

const groq_key = process.env.NEXT_PUBLIC_GROQ_API || "";
const groq_client = new Groq({ apiKey: groq_key });

const supabase_url = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabase_anon_key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const supabase = createClient(supabase_url, supabase_anon_key);

export async function getTrials() {
    try {
        const response = await fetch(API_BASE_URL);

        if (!response.ok) {
            throw new Error(response.statusText);
        }

        const json_response = await response.json();
        // console.log(json_response)

        // Correctly map the data structure based on the console output
        const trials: Trial[] = json_response.studies.map((study: { protocolSection: any }) => {
            const protocolSection = study.protocolSection || {};

            return {
                nctId: protocolSection.identificationModule?.nctId || 'Unknown ID',
                title: protocolSection.identificationModule?.briefTitle || 'No Title',
                conditions: protocolSection.conditionsModule?.conditions || [],
                conditionKeywords: protocolSection.conditionsModule?.keywords || [],
                phase: protocolSection.designModule?.phases?.[0] || 'Not Specified',
                locations: Array.from(new Set(protocolSection.contactsLocationsModule?.locations || [])),
                startDate: protocolSection.statusModule?.startDateStruct?.date || 'Unknown',
                status: protocolSection.statusModule?.overallStatus || 'Unknown',
                participants: protocolSection.designModule?.enrollmentInfo?.count || 'Not Specified',
                description: protocolSection.descriptionModule?.detailedDescription || 'No Description',
                eligibilityCriteria: protocolSection.eligibilityModule?.eligibilityCriteria || 'No Criteria',
                sex: protocolSection.eligibilityModule?.sex || 'Not Specified',
                minimumAge: protocolSection.eligibilityModule?.minimumAge || 'Not Specified',
                maximumAge: protocolSection.eligibilityModule?.maximumAge || 'Not Specified',

            };
        });

        // console.log(trials);

        // Push trials to Supabase trials table
        // Use bulk upsert instead of looping through each trial
        const formattedTrials = trials.map(trial => ({
            nctId: trial.nctId,
            title: trial.title,
            conditions: trial.conditions,
            condition_keywords: trial.conditionKeywords,
            phase: trial.phase,
            locations: trial.locations.map(location => location.facility + ', ' + location.country),
            startDate: trial.startDate,
            status: trial.status,
            num_participants: trial.participants,
            description: trial.description,
            eligibilityCriteria: trial.eligibilityCriteria,
            sex: trial.sex,
            minimumAge: trial.minimumAge,
            maximumAge: trial.maximumAge
        }));

        const { data, error } = await supabase
            .from('trials')
            .upsert(formattedTrials, { 
                onConflict: 'id',
                ignoreDuplicates: false
            }
        );
        // console.log(data)

        if (error) {
            console.error('Error inserting trials:', error);
        } else {
            console.log(`Successfully processed ${formattedTrials.length} trials`);
        }

        // console.log("Processed trials:", trials);

        return NextResponse.json(data);
    } catch (error) {
        return NextResponse.json(
            { message: (error as Error).message },
            { status: 500 }
        );
    }
}

export async function getRecommendations(patientUserId: string) {
    // Fetch patient data
    const { data: patientData } = await supabase
        .from('clients')
        .select('*')

    if (!patientData) {
        throw new Error('Patient not found');
    }
    console.log("patientData: ", patientData);

    // Fetch trials data
    const { data: trials } = await supabase
        .from('trials')
        .select('*');

    if (!trials) {
        throw new Error('Trials not found');
    }

    // Create prompt for LLM
    const prompt = `
        You are a clinical trial matching expert. Based on the patient information and available clinical trials,
        recommend the most optimal clinical trials for this patient.

        For each trial, include all the original trial data plus:
            - matchScore: A number from 0-100 indicating match quality
            - matchReasons: An array of strings explaining why this trial is a good match

        Return ONLY a JSON array of recommended trials sorted by match quality (best matches first). Follow this JSON format:
        {
            id: string;
            created_at: string;
            user_id: string;
            name: string;
            age: number;
            sex: string;
            ethnicity: string;
            location: string;
            phone: number;
            email: string;
            condition: string;
            medications: string;
            condition_description: string;
            allergies: string;
            matchScore: number;
            matchReasons: string[];
        };

        Patient Information:
        ${JSON.stringify(patientData, null, 2)}

        Available Clinical Trials:
        ${JSON.stringify(trials, null, 2)}
    `;

    try {

        // Call Gemini for recommendations
        const response = await groq_client.chat.completions.create({
            messages: [
                {
                    role: "user",
                    content: prompt
                }
            ],
            model: "llama-3.3-70b-versatile"
        });

        if (!response) {
            throw new Error('Gemini failed to generate content');
        }
        const jsonResponse = JSON.parse(response.choices[0]?.message?.content || '');
        
        const { data, error } = await supabase
            .from('clients')
            .update({ recommendations: jsonResponse })
            .eq('user_id', patientUserId);

        if (error) {
            console.error('Error updating recommendations:', error);
        } else {
            console.log(`Successfully updated recommendations for user ${patientUserId}`);
        }

    } catch (error) {
        return NextResponse.json(
            { message: (error as Error).message },
            { status: 500 }
        );
    }
}