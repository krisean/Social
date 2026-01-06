/// <reference types="https://deno.land/x/supabase_functions_types/mod.d.ts" />

declare namespace Deno {
  export function serve(handler: (req: Request) => Response | Promise<Response>): void;
}
