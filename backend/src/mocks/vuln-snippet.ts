export const vulnSnippet = `<?php
function login($username, $password) {
    // ⚠️ Injection SQL : concaténation directe
    $sql = "SELECT * FROM users WHERE user = '$username' AND pass = '$password'";
    return mysqli_query($GLOBALS['db'], $sql);
}

if (isset($_GET['msg'])) {
    // ⚠️ XSS stockée : pas d’échappement
    echo "<div>" . $_GET['msg'] . "</div>";
}
?>`;
