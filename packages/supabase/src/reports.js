import { supabase } from "./client";

export async function insertReport({deviceInfoJSON, app_version, message}) {
    const {error} =  await supabase
        .from('reports')
        .insert([{
            device_info:deviceInfoJSON,
            app_version:app_version,
            message:message
        }]);

    if (error){
        return error
    } else {
        return true
    }
}