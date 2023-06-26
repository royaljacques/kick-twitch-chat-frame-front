interface RequestInterface {
    name: "success" | "error" | "twitch" | "kick" ; 
    data: {
        message: string;
        [key: string]: string
    }
}