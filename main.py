#cv2, numpy: tracing
#matlib: plots
#tkinter: window
import matplotlib.pyplot as plt
from matplotlib.figure import Figure
from matplotlib.backends.backend_tkagg import FigureCanvasTkAgg
import tkinter as tk
from tkinter import Toplevel
from PIL import Image, ImageTk
import cv2
import numpy as np
import matplotlib.pyplot as plt
from scipy import stats
import itertools
from PIL import Image, ImageTk, ImageSequence
from tkinter import PhotoImage, Label, BOTH

def find_green_areas(image_path):
    image = cv2.imread(image_path)
    hsv = cv2.cvtColor(image, cv2.COLOR_BGR2HSV)
    lower_green = np.array([40, 40, 40]) #define range of green
    upper_green = np.array([70, 255, 255])
    mask = cv2.inRange(hsv, lower_green, upper_green) #threshold HSV image -> get only green colors
    return mask

class HoverImageApp(tk.Tk):
    def __init__(self, image_path):
        super().__init__()
        self.configure(bg='#131539')
        self.title('Cape May - Initial View')

        self.scale = 1.0
        self.animating = True 

        self.label = tk.Label(self, bg='#131539')
        self.label.pack(fill=tk.BOTH, expand=True)

        self.gif_frames = self.load_gif_frames(gif_path)
        self.current_gif_frame = 0
        self.show_next_gif_frame()

        self.label.bind("<Button-1>", self.change_to_jpg)
        self.jpg_path = jpg_path
    
    def load_gif_frames(self, file_path):
        with Image.open(file_path) as img:
            return [ImageTk.PhotoImage(frame.copy()) for frame in ImageSequence.Iterator(img)]

    def show_next_gif_frame(self):
        if self.animating:  #check flag before updating fram
            frame = self.gif_frames[self.current_gif_frame]
            self.label.configure(image=frame)
            self.current_gif_frame = (self.current_gif_frame + 1) % len(self.gif_frames)
            self.after(100, self.show_next_gif_frame)

    def change_to_jpg(self, event):
        self.animating = False  #stop 
        self.title('Cape May - Map')
        self.configure(bg='#131539')

        self.original_image = cv2.imread(self.jpg_path)
        self.image = self.original_image.copy()
        self.mask = find_green_areas(self.jpg_path)

        self.photo_image = ImageTk.PhotoImage(image=Image.fromarray(cv2.cvtColor(self.image, cv2.COLOR_BGR2RGB)))
        self.label.config(image=self.photo_image)
        
        self.label.bind("<Motion>", self.on_motion)
        self.label.bind("<MouseWheel>", self.on_mouse_wheel)
        
        self.regression_button = tk.Button(self, text='Show Regression', command=self.show_regression, bg='black', fg='white')
        self.regression_button.pack(side='top', anchor='ne', padx=10, pady=10)



    def show_regression(self):
        wavelengths = [400, 500, 600, 700, 800, 900, 1000, 1100, 1200, 1300, 1400, 1500, 1600, 1700, 1800, 1900, 2000] #EO snow data
        reflectance_area_of_interest = [0.0408, 0.0559, 0.0631, 0.0599, 0.0724, 0.0809, 0.0895, 0.0999, 0.0982, 0.0970, 0.0937, 0.0672, 0.9838, 0.9852, 0.9810, 0.9579, 0.9455]
        reflectance_snow = [0.9838, 0.9852, 0.9810, 0.9579, 0.9455, 0.9362, 0.9119, 0.8977, 0.8548, 0.7977, 0.0425, 0.0704, 0.0362, 0.0199, 0.0048, 0.0001, 0.0]

        root = tk.Tk()
        root.title("Spectral Data")

        fig = Figure(figsize=(8, 6), facecolor='white')
        ax = fig.add_subplot(111)

        ax.plot(wavelengths, reflectance_area_of_interest, 'yo-', label='Area of interest')  #yellow line
        ax.plot(wavelengths, reflectance_snow, 'bo-', label='Snow (medium granular snow)')  #blue line 

        ax.set_xlabel('Wavelength (nm)', fontsize=14, color='black')
        ax.set_ylabel('Reflectance', fontsize=14, color='black')
        ax.set_title('Snow (Medium Granular Snow) Chart - 2024', fontsize=16, color='black')

        ax.tick_params(colors='black', which='both')  #ticks
        ax.grid(True, which='both', color='gray', linestyle='--', linewidth=0.5)  #grid lines

        ax.spines['bottom'].set_color('black')
        ax.spines['top'].set_color('black') 
        ax.spines['right'].set_color('black')
        ax.spines['left'].set_color('black')

        ax.legend(facecolor='white')

        canvas = FigureCanvasTkAgg(fig, master=root)
        canvas.draw()
        canvas.get_tk_widget().pack(side=tk.TOP, fill=tk.BOTH, expand=1)

        root.mainloop()

    def on_motion(self, event):
        if event is not None:
            x, y = int(event.x / self.scale), int(event.y / self.scale)  #scale mouse
            if 0 <= x < self.mask.shape[1] and 0 <= y < self.mask.shape[0]:  #check if within bounds of scale
                if self.mask[y, x]:  #check if over green
                    highlighted_image = self.image.copy()  #redraw contours
                    contours, _ = cv2.findContours(self.mask, cv2.RETR_TREE, cv2.CHAIN_APPROX_SIMPLE)
                    cv2.drawContours(highlighted_image, contours, -1, (0, 0, 255), 1)
                    self.update_image_display(highlighted_image)
                else:
                    self.update_image_display(self.image)
        else:
            self.update_image_display(self.image)



    def on_mouse_wheel(self, event):
        scale_amount = 0.1
        if event.delta > 0:
            self.scale *= (1 + scale_amount)  #zoom in
        elif event.delta < 0:
            self.scale /= (1 + scale_amount)  #zoom out

        self.scale = max(0.1, min(self.scale, 10))
        self.update_image_display(self.image)  

    def update_image_display(self, image):
        width = int(image.shape[1] * self.scale)
        height = int(image.shape[0] * self.scale)
        resized_image = cv2.resize(image, (width, height), interpolation=cv2.INTER_LINEAR)

        self.photo_image = ImageTk.PhotoImage(image=Image.fromarray(cv2.cvtColor(resized_image, cv2.COLOR_BGR2RGB)))
        self.label.config(image=self.photo_image)


if __name__ == "__main__":
    gif_path = r"C:\Users\Rahul\Documents\independent study\cape_may_timelapse.gif"  
    jpg_path = r"C:\Users\Rahul\Documents\independent study\cape_may_urban.jpg"   
    app = HoverImageApp(r"C:\Users\Rahul\Documents\independent study\cape_may_urban.jpg")
    app.mainloop()