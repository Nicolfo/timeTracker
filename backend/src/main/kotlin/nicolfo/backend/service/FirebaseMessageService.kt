package nicolfo.backend.service

interface FirebaseMessageService {
    fun saveDeviceToken(firebaseId: String, username:String)
    fun sendReminder(message:String) : Unit
}