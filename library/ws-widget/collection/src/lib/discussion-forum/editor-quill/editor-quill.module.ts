import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { EditorQuillComponent } from './editor-quill.component'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import { QuillModule } from 'ngx-quill'
import { quillBaseConfig } from './config/quill-config'

@NgModule({
  declarations: [EditorQuillComponent],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    QuillModule.forRoot(quillBaseConfig),
  ],
  exports: [EditorQuillComponent],
})
export class EditorQuillModule { }
