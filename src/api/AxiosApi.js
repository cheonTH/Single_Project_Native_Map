let backendHost;

const hostname = window && window.location && window.location.hostname;


backendHost = "http://springboot-developer-single.eba-49z7darg.ap-northeast-2.elasticbeanstalk.com"
// backendHost = "http://localhost:5000"

export const API_BASE_URL = `${backendHost}`