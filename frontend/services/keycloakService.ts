import Keycloak from 'keycloak-js';

/**
 * Keycloak singleton instance.
 * Cấu hình kết nối đến realm hospital-management tại localhost:8081.
 *
 * Thay đổi:
 *  - url: địa chỉ Keycloak server
 *  - realm: tên realm
 *  - clientId: tên client đã tạo trong Keycloak (Public client, PKCE enabled)
 */
const keycloak = new Keycloak({
    url: 'http://localhost:8081',
    realm: 'hospital-management',
    clientId: 'hospital-client',
});

export default keycloak;
