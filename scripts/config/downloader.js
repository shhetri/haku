import request from "request";

const downloader = () => {
    return {
        /**
         * Download the file from the provided download link and call the callback when the download is finished
         *
         * @param link
         * @param callback
         */
        download(link, callback){
            request(link, (error, response, body)=> {
                if (error) {
                    throw new Error(error);
                }

                if (200 !== response.statusCode) {
                    throw new Error('Download ko url ta milena pasa');
                }

                callback(body);
            });
        }
    }
};

export default downloader();
