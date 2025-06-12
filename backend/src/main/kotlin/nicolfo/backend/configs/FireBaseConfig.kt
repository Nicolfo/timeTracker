package nicolfo.backend.configs

import com.google.auth.oauth2.GoogleCredentials
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import java.io.FileInputStream
import com.google.firebase.FirebaseApp
import com.google.firebase.FirebaseOptions
import com.google.firebase.messaging.FirebaseMessaging
import org.springframework.beans.factory.annotation.Value

@Configuration
class FirebaseConfig (
    @Value("\${firebase-certificate-path}")
    private val firebaseCertificatePath:String,
){

    fun initializeFirebase(): FirebaseApp {
        println("serviceAccountPath: $firebaseCertificatePath")
        FileInputStream(firebaseCertificatePath).use { serviceAccount ->
            val options = FirebaseOptions.builder()
                .setCredentials(GoogleCredentials.fromStream(serviceAccount))
                .build()

            return if (FirebaseApp.getApps().isEmpty()) {
                FirebaseApp.initializeApp(options)
            } else {
                FirebaseApp.getInstance()
            }
        }
    }

    @Bean
    fun firebaseMessaging(): FirebaseMessaging {
        initializeFirebase()
        return FirebaseMessaging.getInstance()
    }
}