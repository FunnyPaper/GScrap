export function varsLeft(config: any): boolean {
    return !!Object.keys(config).find((key) => {
        if (typeof config[key] == 'string') {
            const property: String = config[key];
            const templates = property.match(/\{\{(.*?)\}\}/g);
            return !!templates;
        } 

        return varsLeft(config[key]);
    });
}

export function updateVars(config: any, vars: any): void {    
    Object.keys(config).forEach((key) => {
        if (typeof config[key] == 'string') {
            const property: String = config[key];
            const templates = property.match(/(?<=\{\{)(.*?)(?=\}\})/g);
            if(templates) {
                templates.forEach(template => {
                    const parts: string[] = template.split(':');
                    if(parts[0] in vars) {
                        config[key] = config[key].replace(`\{\{${template}\}\}`, vars[parts[0]]);
                    } else if(parts.length > 1) {
                        config[key] = config[key].replace(`\{\{${template}\}\}`, parts.slice(1).join(':'));
                    }
                });
            }
        } else {
           updateVars(config[key], vars); 
        }
    });
}