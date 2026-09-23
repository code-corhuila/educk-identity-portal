<template>
  <ion-page>
    <ion-content class="ion-padding">
      <div class="login-container">
        <ion-card>
          <ion-card-header>
            <ion-card-title>EduTrack Login</ion-card-title>
          </ion-card-header>
          <ion-card-content>
            <form @submit.prevent="handleLogin">
              <ion-item>
                <ion-input
                  v-model="email"
                  type="email"
                  label="Email"
                  label-placement="floating"
                  placeholder="Enter your email"
                  required
                ></ion-input>
              </ion-item>
              
              <ion-item>
                <ion-input
                  v-model="password"
                  type="password"
                  label="Password"
                  label-placement="floating"
                  placeholder="Enter your password"
                  required
                ></ion-input>
              </ion-item>

              <div v-if="errorMessage" class="error-message">
                {{ errorMessage }}
              </div>

              <ion-button
                expand="block"
                type="submit"
                :disabled="isLoading"
                class="ion-margin-top"
              >
                {{ isLoading ? 'Logging in...' : 'Login' }}
              </ion-button>
            </form>
          </ion-card-content>
        </ion-card>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { 
  IonPage, 
  IonContent, 
  IonCard, 
  IonCardHeader,
  IonCardTitle,
  IonCardContent, 
  IonItem, 
  IonInput, 
  IonButton 
} from '@ionic/vue';
import apiClient, { setToken } from '../services/apiClient';

const router = useRouter();

const email = ref('');
const password = ref('');
const errorMessage = ref('');
const isLoading = ref(false);

const handleLogin = async () => {
  errorMessage.value = '';
  isLoading.value = true;
  
  try {
    const response = await apiClient.post('/auth/login', {
      email: email.value,
      password: password.value
    });
    
    const { token } = response.data;
    
    if (token) {
      setToken(token);
      router.push('/dashboard'); // or wherever the home route is
    } else {
      errorMessage.value = 'Invalid response from server';
    }
  } catch (error: any) {
    if (error.response && error.response.data && error.response.data.message) {
      errorMessage.value = error.response.data.message;
    } else {
      errorMessage.value = 'Login failed. Please check your credentials.';
    }
  } finally {
    isLoading.value = false;
  }
};
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
}

ion-card {
  width: 100%;
  max-width: 400px;
}

.error-message {
  color: var(--ion-color-danger);
  font-size: 0.9em;
  margin-top: 10px;
  text-align: center;
}
</style>
